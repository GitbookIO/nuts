sequenceDiagram
participant User as User or App
participant Pecans
participant Github
participant Developer

    Developer-->>Github: Publish Release
    User-->>+Pecans: Request Latest Release
    Pecans-->>Github: Request Releases
    Github-->>Pecans: Send Releases and Assets metadata
    alt public repo
      Pecans-->>User: Send Public Asset Url
    else private repo
      Pecans-->>Github: Request Protected Asset Url for Release Asset
      Github-->>Pecans: Send  Download
      Pecans-->>User: Send Protected Asset Url
    end
