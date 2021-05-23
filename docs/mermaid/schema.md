graph LR
    A[Developers] -->|Publish Release| B[Github]
    D --> | Install | E[Application]
    C -->|Send Update Download URL | E
    D[Users] -->| Download Installer | C
    E -->|Check for Updates| C
    E -->|Download Update | B
    C{Pecans} --> | Fetches Release Metadata| B