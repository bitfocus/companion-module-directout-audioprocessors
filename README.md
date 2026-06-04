# companion-module-directout-audioprocessors

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)  
See the issues section for known bugs or feature requests.

## Description

This modules interfaces the audio processors of the PRODIGY and MAVEN series with Companion.

## :rocket: Version History

### 1.1.0 (2026-06-04)

- notice: :link: This version requires at least Companion 4.0.0

- feature: add an incremental entry mode for all numeric options additionally to the absolut entry. This is very convenient for use on rotary encoders.
- feature: add a routing option by selecting and take operation including various variables
- bugfix: use correct endpoint for check patch feedback on PRODIGY.MC
- bugfix: use correct slot IDs for EARS actions and variables on MAVEN.A (Network was Madi and Madi was unavailable)
- bugfix: correct assignment for sources of the network ports beyond the first 128 in sum bus assignment for PRODIGY.MX
- bugfix: clamp to correct minimal value even for minimum of 0
- chore: update dependency @companion-module/base from 1.11.3 to 1.12.1
- chore: update dependency @companion-module/tools from 2.6.1 to 2.7.2
- chore: update dependency @types/node from 22.14.1 to 22.19.19
- chore: update dependency ajv from 6.12.6 to 6.14.0
- chore: update dependency eslint from 9.36.0 to 9.39.4
- chore: update dependency flatted from 3.3.3 to 3.4.2
- chore: update dependency glob from 11.0.3 to 11.1.0
- chore: update dependency js-yaml from 4.1.0 to 4.1.1
- chore: update dependency nanoid from 3.3.11 to 3.3.12
- chore: update dependency picomatch from 2.3.1 to 2.3.2
- chore: update dependency prettier from 3.6.2 to 3.8.3
- chore: update dependency rimraf from 6.0.1 to 6.1.3
- chore: update dependency tar from 7.5.2 to 7.5.11
- chore: update dependency typescript-eslint from 8.45.0 to 8.60.0
- chore: update dependency zx from 8.8.4 to 8.8.5

### 1.0.1 (2025-11-09)

- bugfix: use correct endpoint for routing at PRODIGY.MC

### 1.0.0 (2025-10-01)

- major: initial Release
- feat: initial actions with learn functionality for many parameters
- feat: initial feedbacks with learn functionality for many parameters
- feat: variables including custom variables functionality
- feat: presets
- feat: action recorder for all device state changes
- feat: expression support for text inputs
- feat: dynamic update of dropdown values
- feat: toggle functionality for boolean parameters
- feat: next/previous functionality for list parameters
