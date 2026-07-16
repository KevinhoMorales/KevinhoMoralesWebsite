/** URLs oficiales o documentación de referencia por tecnología. */
const SKILL_URLS: Record<string, string> = {
  Swift: 'https://www.swift.org/',
  SwiftUI: 'https://developer.apple.com/swiftui/',
  UIKit: 'https://developer.apple.com/documentation/uikit',
  Kotlin: 'https://kotlinlang.org/',
  Java: 'https://dev.java/',
  Flutter: 'https://flutter.dev/',
  Dart: 'https://dart.dev/',
  'React Native': 'https://reactnative.dev/',
  MVVM: 'https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm',
  'Clean Architecture':
    'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
  Modularization: 'https://developer.apple.com/documentation/xcode/improving-app-acceleration',
  GraphQL: 'https://graphql.org/',
  'REST APIs': 'https://developer.mozilla.org/en-US/docs/Glossary/REST',
  'Performance tuning': 'https://developer.apple.com/documentation/xcode/improving-app-performance',
  'Code quality': 'https://www.sonarqube.org/',
  Firebase: 'https://firebase.google.com/',
  'Spring Boot': 'https://spring.io/projects/spring-boot',
  TypeScript: 'https://www.typescriptlang.org/',
  Docker: 'https://www.docker.com/',
  'Cloud services': 'https://cloud.google.com/',
  'Vertex AI': 'https://cloud.google.com/vertex-ai',
  Cursor: 'https://cursor.com/',
  Xcode: 'https://developer.apple.com/xcode/',
  'Android Studio': 'https://developer.android.com/studio',
  Git: 'https://git-scm.com/',
  'CI/CD': 'https://github.com/features/actions',
  'Generative AI': 'https://ai.google/',
};

export function getSkillOfficialUrl(skill: string): string | undefined {
  return SKILL_URLS[skill];
}
