# Changelog

All notable changes to the Polymarket Copier project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Random marketplace skip functionality to improve market variance distribution
  - 1/6 chance (16.7%) to randomly skip creating markets on individual marketplaces
  - Provides better spread of markets across different platforms
  - Includes detailed logging when skips occur

- URL generation system for market and external market entries
  - `createSlug()` function converts market questions to URL-friendly slugs
  - Removes symbols, converts to lowercase, replaces spaces with dashes
  - Generates consistent URLs for frontend routing

- Market URL integration
  - Parent markets get URLs: `https://localhost:3001/markets/{slug}`
  - External markets get marketplace-specific URLs: `https://localhost:3005/{marketplace-prefix}/getMarketData/{slug}`

- Marketplace URL prefix mapping
  - ID 2 (Slaughterhouse Predictions): `slaughterhouse-predictions`
  - ID 3 (Terminal Degeneracy Labs): `terminal-degeneracy-labs`
  - ID 4 (Degen Execution Chamber): `degen-execution-chamber`
  - ID 5 (Nihilistic Prophet Syndicate): `nihilistic-prophet-syndicate`
  - ID 1 (Polymarket): Uses original market URL as fallback

### Changed
- Database insertion logic now includes URL fields
  - Added `url` field to markets table inserts
  - Added `url` and `marketplace_id` fields to external_markets table inserts
  - Enhanced marketplace lookup and URL generation flow

- Enhanced PolymarketMarket interface
  - Added optional `url` field to support URL handling
  - Maintains backward compatibility with existing code

### Technical Details
- Implemented `getMarketplacePrefix()` helper function for URL routing
- Added comprehensive URL generation with fallback handling
- Enhanced database integration for marketplace adapter REST API compatibility
- Improved logging and debugging output for marketplace variance tracking

### Notes
- Polymarket URL structure requires further investigation per their API documentation
- Route handlers for marketplace adapter API endpoints pending implementation
- All URL patterns ready for localhost development environment