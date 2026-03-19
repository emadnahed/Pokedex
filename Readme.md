# 🧬 Pokédex – Advanced React Native Mobile Engineering Project

A **production-grade Pokédex mobile application** built with **React Native and TypeScript**, designed to explore Pokémon data with rich animations, powerful filtering, and a polished user experience.

This project goes far beyond a simple Pokémon viewer. It is intentionally architected to demonstrate **senior-level React Native engineering skills**, including:

* scalable mobile architecture
* advanced navigation patterns
* performance optimization
* complex API orchestration
* animation systems
* offline caching
* automated testing
* CI/CD pipelines

The application consumes data from the **PokeAPI**, a comprehensive and free Pokémon API.

---

### 🚀 Download the App


<p align="center">
  <a href="https://drive.google.com/file/d/1WeV1vE7owJOq5HDt7ElI04j6k0RHsvEK/view?usp=sharing">
    <img src="https://img.shields.io/badge/Android-APK-3DDC84?logo=android&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://drive.google.com/file/d/1FgzImXzyrDMWl89Uh6N35T9IlpwtPagU/view?usp=sharing">
    <img src="https://img.shields.io/badge/iOS-IPA-000000?logo=apple&logoColor=white&style=for-the-badge" />
  </a>
</p>

---

# 📱 Application Overview

The Pokédex app allows users to:

* Browse the **entire Pokémon database**
* Search Pokémon by name or number
* Filter Pokémon by **type**
* View detailed Pokémon stats
* Explore **evolution chains**
* View **animated sprites**
* Navigate smoothly across multiple nested screens
* Save favorite Pokémon
* Use cached data for faster loading

The project focuses on **UI polish, performance, and architecture**, mirroring real-world production mobile applications.

---

# 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/611a67dd-b44a-4b53-8333-e516124d84ab" width="30%" />
  <img src="https://github.com/user-attachments/assets/da403df4-219e-43ce-9be4-2a813696e440" width="30%" />
  <img src="https://github.com/user-attachments/assets/4f824d28-a9bc-4650-87b9-d9e74a2afbba" width="30%" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/9ed78d3c-d398-46bf-b1fa-05b602f3efd7" width="30%" />
  <img src="https://github.com/user-attachments/assets/4624f0ac-2cbc-461b-a044-0f34c938af0c" width="30%" />
</p>

---

# 🎯 Project Objectives

This project demonstrates the engineering skills expected from a **Senior React Native Developer**, including:

* Designing scalable mobile application architecture
* Implementing nested navigation flows
* Managing complex API relationships
* Optimizing performance for large datasets
* Implementing advanced UI animations
* Writing automated tests
* Implementing CI/CD workflows
* Ensuring maintainability and code quality

---

# 🧠 Skills Demonstrated

This project covers **20+ advanced React Native skills**, including:

## React Native Core

* Functional components
* React Hooks
* Custom hooks
* Component composition
* Reusable UI systems

## TypeScript for Mobile

* Strict typing
* API response typing
* Interface modeling
* Type-safe navigation

## Mobile Architecture

* Feature-based architecture
* Modular folder structure
* Separation of UI and data layers
* Scalable state management

## State Management

* Redux Toolkit
* Async state flows
* State normalization
* Global state orchestration

## Navigation Systems

* React Navigation
* Nested navigation stacks
* Dynamic routing
* Deep linking readiness

## API Integration

* RESTful API orchestration
* Axios networking layer
* Multi-endpoint data aggregation
* Error handling strategies

## Data Relationships

Pokémon data involves **linked resources**, including:

* species
* evolutions
* abilities
* stats

The app demonstrates how to manage **multi-step API relationships** efficiently.

## Performance Optimization

* FlatList virtualization
* image optimization
* memoized components
* lazy loading strategies

## Animations

* React Native Reanimated
* sprite animation rendering
* gesture-based UI transitions

## Offline Caching

* MMKV storage
* cached Pokémon metadata
* improved app startup performance

## Testing

* Unit testing with Jest
* Component testing
* End-to-End testing with Detox

## DevOps & CI/CD

* automated builds
* test automation
* mobile pipeline workflows

---

# 🏗 Architecture

The application follows a **feature-driven modular architecture**, which keeps the codebase scalable and maintainable.

```text
src
│
├── api
│   ├── pokeApi.ts
│   └── pokemonService.ts
│
├── components
│   ├── PokemonCard.tsx
│   ├── TypeBadge.tsx
│   ├── StatBar.tsx
│   └── SearchBar.tsx
│
├── features
│   └── pokedex
│        ├── PokedexScreen.tsx
│        ├── PokemonDetailScreen.tsx
│        ├── EvolutionScreen.tsx
│        ├── pokemonSlice.ts
│        └── pokemonSelectors.ts
│
├── navigation
│   ├── RootNavigator.tsx
│   └── PokedexNavigator.tsx
│
├── hooks
│   └── usePokemon.ts
│
├── store
│   └── store.ts
│
├── utils
│   ├── pokemonHelpers.ts
│   └── typeColors.ts
│
└── App.tsx
```

Architecture principles applied:

* modular features
* clear separation of responsibilities
* testable components
* scalable folder structure

---

# 🔗 API Integration

The application uses the **PokeAPI**.

API Base URL

```text
https://pokeapi.co/api/v2
```

Example endpoints used:

```text
/pokemon
/pokemon/{id}
/pokemon-species/{id}
/evolution-chain/{id}
/type/{type}
```

The application orchestrates multiple API calls to retrieve:

* Pokémon details
* stats
* abilities
* evolution chains
* types
* sprites

---

# 📱 Screens & Navigation

The application demonstrates **nested navigation architecture**.

Navigation hierarchy:

```text
Root Navigator
   └── Pokedex Navigator
        ├── Pokedex Screen
        ├── Pokemon Detail Screen
        └── Evolution Screen
```

---

# 🧾 Screen Breakdown

## 1️⃣ Pokédex Screen

Displays the complete Pokémon list.

Features:

* search by name or ID
* type-based filtering
* paginated data loading
* optimized list rendering

Each Pokémon card shows:

* sprite image
* Pokémon name
* Pokémon number
* type badges

---

## 2️⃣ Pokémon Detail Screen

Displays comprehensive Pokémon information.

Includes:

* animated sprite
* height
* weight
* base stats
* abilities
* type information

Stats visualization uses animated progress bars.

---

## 3️⃣ Evolution Chain Screen

Shows the **full Pokémon evolution chain**.

Features:

* branching evolution visualization
* animated transitions
* navigation to related Pokémon

This demonstrates handling **hierarchical data relationships**.

---

# ⚡ Performance Optimization

Pokédex data can grow very large. Several strategies are used:

### FlatList Virtualization

```text
initialNumToRender={12}
maxToRenderPerBatch={10}
windowSize={5}
removeClippedSubviews
```

### Memoization

* React.memo
* useMemo
* useCallback

### Image Optimization

Sprites are cached and lazily loaded to reduce memory usage.

---

# 🎨 Animation System

Animations improve the visual quality of the app.

Implemented with:

* React Native Reanimated
* Layout transitions
* Sprite animation rendering

Examples:

* Pokémon card hover effects
* stat bar animations
* smooth screen transitions

---

# 📦 Offline Support

To improve performance and reduce network dependency, Pokémon metadata is cached locally.

Storage engine:

* MMKV

Caching strategy:

1. Fetch Pokémon list
2. Cache metadata locally
3. Load cached data on next launch

This ensures faster startup and offline browsing capabilities.

---

# 🧪 Testing Strategy

## Unit Testing

Frameworks:

* Jest
* React Native Testing Library

Components tested:

* PokemonCard
* TypeBadge
* StatBar
* SearchBar

Test coverage includes:

* rendering correctness
* component props
* user interactions

---

## End-to-End Testing

Framework:

* Detox

Example test scenarios:

1. Launch application
2. Search for Pokémon
3. Open Pokémon details
4. Navigate to evolution chain
5. Return to Pokédex

These tests validate **real user workflows**.

---

# 🚀 CI/CD Pipeline

The project supports automated build pipelines.

Typical pipeline steps:

1. Install dependencies
2. Run lint checks
3. Run unit tests
4. Run E2E tests
5. Build Android application
6. Build iOS application

Supported CI platforms:

* Bitrise
* GitHub Actions

---

# 🔐 Security Considerations

Although PokeAPI is public, the application follows security best practices:

* dependency auditing
* safe network request handling
* secure local storage usage

---

# 🎨 UI/UX Design Philosophy

The interface emphasizes:

* vibrant Pokémon-inspired colors
* smooth animations
* responsive layout
* intuitive navigation

Design goals:

* playful yet performant
* visually engaging
* minimal cognitive friction

---

# 🛠 Installation

Clone the repository.

```bash
git clone https://github.com/yourusername/react-native-pokedex.git
```

Navigate to the project directory.

```bash
cd react-native-pokedex
```

Install dependencies.

```bash
npm install
```

Run iOS.

```bash
npx pod-install
npm run ios
```

Run Android.

```bash
npm run android
```

---

# 🧰 Tech Stack

Core

* React Native
* TypeScript

State Management

* Redux Toolkit

Navigation

* React Navigation

Networking

* Axios

Animations

* React Native Reanimated

Storage

* MMKV

Testing

* Jest
* Detox

CI/CD

* Bitrise / GitHub Actions

---

# 📊 Potential Future Enhancements

Possible improvements:

* Pokémon team builder
* battle simulation
* Pokémon comparison
* dark mode
* sprite animation upgrades
* Pokémon region filtering

---

# 👨‍💻 Author

This project was built as a **professional portfolio project** demonstrating advanced mobile engineering capabilities with React Native.

Focus areas include:

* scalable mobile architecture
* high-performance UI rendering
* complex API orchestration
* polished mobile UX

---

# 📜 License

MIT License

---

# ⭐ Project Purpose

The goal of this project is to showcase **production-quality React Native engineering practices**, rather than simple tutorial examples.

It demonstrates:

* scalable architecture
* nested navigation
* animation systems
* performance optimization
* robust testing strategies
* mobile DevOps workflows

