IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactMessages (
        id BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_ContactMessages PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        subject NVARCHAR(160) NULL,
        message NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2(0) NOT NULL
            CONSTRAINT DF_ContactMessages_created_at DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_ContactMessages_created_at
        ON dbo.ContactMessages (created_at DESC);
END;
GO
