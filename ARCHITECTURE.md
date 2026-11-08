# Arquitectura Frontend (Feature-Based)

Este proyecto utiliza una estructura basada en features para mejorar escalabilidad, mantenimiento y colaboracion.

## Estructura base

src/
  app/
    App.tsx

  features/
    layout/
      AppShell.tsx
      index.ts
    home/
      HomePage.tsx
      index.ts

  shared/
    config/
      menu.ts
    styles/
      global.css

  services/
    http/
      client.ts

  types/
    env.d.ts

## Principios

1. Separacion por dominio (feature-first)
- Cada modulo funcional vive dentro de features.
- Se evita acoplar componentes de negocio en carpetas globales.

2. Public API por feature
- Cada feature expone su API publica con index.ts.
- Esto reduce imports fragiles a rutas internas.

3. Shared solo para recursos transversales
- Configuracion global, estilos y utilidades compartidas van en shared.
- Si una pieza pertenece a una sola feature, se mantiene dentro de esa feature.

4. Servicios de infraestructura aislados
- Las funciones de acceso a backend viven en services.
- El dominio consume servicios, no detalles de infraestructura.

5. Contratos centralizados
- Tipos compartidos y entorno se definen en types.

## Convenciones de imports

Aliases configurados:
- @app/*
- @features/*
- @shared/*
- @services/*
- @types/*
- @/*

## Proximo paso recomendado

1. Crear nuevas features segun modulos del negocio.
2. Co-localizar componentes, hooks, tipos y servicios especificos por feature.
3. Mantener shared pequeno y realmente transversal.
