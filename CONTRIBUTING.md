# How to Contribute

## Creating a New Feature Module

All new business features should be created as self-contained modules within the `/apps/server/src/modules` directory. Each new module must follow our Clean Architecture structure:

* **/domain**: Contains the core business logic, aggregates, and repository interfaces.
* **/application**: Contains the controllers and use cases that orchestrate the domain logic.
* **/infrastructure**: Contains the concrete implementations, such as TypeORM repositories.
