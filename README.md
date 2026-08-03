# Ragic n8n Node

This repository contains a **custom n8n node** for integrating with **Ragic**.  
It allows you to automate and interact with your Ragic database directly from n8n workflows.

## Features

The node currently supports the following functionalities:

- **Webhook**: Listen for real-time events from Ragic.
- **Read**: Retrieve records from your Ragic database.
- **Update**: Update existing records in your Ragic database.
- **Create**: Create new records with custom logic in your Ragic database.
- **Retrieve File**: Retrieve files from your Ragic database.
- **Execute Action Button**: Execute an action button on a specific record.

## Version History

- **v2.9.1**
  - **Retrieve File Optimization**: Improved authenticated file retrieval efficiency and input validation.

- **v2.9.0**
  - **Trigger Node**: The webhook now emits **every changed record** as a separate item, and adds a **`changedFields`** attribute listing the IDs of the fields that changed — on the record for top-level fields, and on each affected subtable row for subtable fields. Previously, a mass operation (such as a mass update) only triggered the workflow with the first record.
    *(Note: Existing workflows need to be re-activated (deactivate, then activate) once after upgrading for these changes to take effect.)*

- **v2.8.3**
  - No functional changes. Adds npm provenance support for n8n Creator Portal verification.

- **v2.8.2**
  - **Compatibility Fix**: Fixed compatibility with n8n Cloud.

- **v2.8.1**
  - **Bug Fix**: Fixed an intermittent file upload failure in Field Mode.

- **v2.8.0**
  - **Action Node**: Added support for **multi-item execution**, with proper parameter retrieval and output mapping for each input item.

- **v2.7.0**
  - **Trigger Node**: Added support for listening to **Delete Records** events.
  - **Action Node**: Added support for **Execute Action Button**.

- **v2.6.0**
  - Internal improvements and compatibility updates.

- **v2.5.0**
  - **Credential Update**: Adjusted credential settings of **Ragic Action Node** to support **private servers**.
    *(Note: Users upgrading to this version need to update their existing credentials, regardless of whether they are connecting to a private server or not.)*
  - **Enhanced Create/Update Operations**:
    - Added options to **recalculate all formulas** when creating or updating records.
    - Added control over the timing of **Link & Load field loading** for formulas.
  - **Retrieve File Optimization**: Improved output values for better usability in workflows.

- **v2.4.0**
  - Added support for **credential verification**

- **v2.3.1**
  - Bug fix: Corrected behavior when creating/updating records so that **formula**, **default value**, **link & load**, **workflow**, and **notification** are properly executed.

- **v2.3.0**
  - Added support for **Upload File**
  - Added **Update Subtable Fields**
  - Support for setting **multiple values in multi-select fields** within Field Method
  - Updated display name of **Ragic Trigger** in the nodes panel
  - Other bug fixes

- **v2.2.1**
  - Added support for **Retrieve File**

- **v2.1.0**
  - Added support for **Read Data**

- **v2.0.0**
  - Added support for **field-based configuration**

- **v1.0.0**
  - Initial release: **Webhook**, **Update**, **Create**
