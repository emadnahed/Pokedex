/**
 * Expo config plugin that ensures libNitroModules.so AND its C++ headers are
 * present in mmkv's refs snapshot directory before the ninja build runs.
 *
 * Root cause: AGP creates the refs directory during configureCMake but does
 * NOT copy the actual .so or headers for local-project (non-maven) prefab
 * dependencies. Ninja then fails with "missing and no known rule to make it"
 * and clang fails with "file not found" for NitroModules headers.
 *
 * Fix:
 *  1. Wire each buildCMake task in mmkv to depend on nitro's externalNativeBuild
 *     (using a string path so it resolves lazily without configuration-context issues).
 *  2. Add a doFirst action that reads prefab_publication.json from each refs hash
 *     dir and copies both the abiLibrary .so AND the moduleHeaders there before
 *     ninja starts.
 *     doFirst runs after configureCMake has already finished (AGP guarantees
 *     configure → build order) and after all declared dependencies have run.
 */
const { withProjectBuildGradle } = require('@expo/config-plugins');

const GRADLE_HOOK = `
// NitroBuildFix: copy libNitroModules.so + headers into mmkv's refs snapshot so ninja can link.
afterEvaluate {
  def mmkvProject  = allprojects.find { it.name == 'react-native-mmkv' }
  def nitroProject = allprojects.find { it.name == 'react-native-nitro-modules' }
  if (!mmkvProject || !nitroProject) return

  ['Debug', 'Release'].each { buildType ->
    mmkvProject.tasks.matching { it.name.startsWith("buildCMake\${buildType}") }.configureEach { buildTask ->
      // 1. Ensure nitro is fully built before mmkv links.
      //    String path resolves lazily — safe to use inside configureEach.
      buildTask.dependsOn("\${nitroProject.path}:externalNativeBuild\${buildType}")

      // 2. Copy the missing .so AND headers into the refs snapshot before ninja.
      //    By the time doFirst runs: (a) configure is done (AGP guarantees it),
      //    (b) nitro's build is done (declared above), so all paths exist.
      buildTask.doFirst {
        def refsDir = new File(mmkvProject.projectDir,
            "build/intermediates/cxx/refs/react-native-nitro-modules")
        if (!refsDir.exists()) return
        refsDir.eachDir { hashDir ->
          def pubFile = new File(hashDir, "prefab_publication.json")
          if (!pubFile.exists()) return
          def pub = new groovy.json.JsonSlurper().parse(pubFile)
          pub?.packageInfo?.modules?.each { mod ->
            // Copy .so for each ABI
            mod?.abis?.each { abiEntry ->
              def srcFile = new File(abiEntry.abiLibrary as String)
              if (!srcFile.exists()) {
                logger.warn("[NitroBuildFix] abiLibrary not found: \${srcFile}")
                return
              }
              def destDir = new File(hashDir,
                  "modules/\${mod.moduleName}/libs/android.\${abiEntry.abiName}")
              def destFile = new File(destDir, srcFile.name)
              if (destDir.exists() && !destFile.exists()) {
                logger.lifecycle("[NitroBuildFix] copying \${srcFile.name} (\${abiEntry.abiName})")
                project.copy { from srcFile; into destDir }
              }
            }
            // Copy C++ headers (moduleHeaders → refs/.../modules/<name>/include/)
            // AGP creates include/ with only a placeholder.txt for local-project deps.
            // Copy is needed if the actual <moduleName>/ subdirectory isn't there yet.
            if (mod?.moduleHeaders) {
              def headersDir = new File(mod.moduleHeaders as String)
              def destInclude = new File(hashDir, "modules/\${mod.moduleName}/include")
              def headersSubdir = new File(destInclude, mod.moduleName as String)
              if (headersDir.exists() && !headersSubdir.exists()) {
                logger.lifecycle("[NitroBuildFix] copying headers for \${mod.moduleName}")
                project.copy { from headersDir; into destInclude }
              }
            }
          }
        }
      }
    }
  }
}
`;

module.exports = function withNitroBuildFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('NitroBuildFix: copy libNitroModules')) {
      config.modResults.contents += GRADLE_HOOK;
    }
    return config;
  });
};
