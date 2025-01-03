# Privacy Policy for Browser Statistics Exporter Extension

Effective Date: January 3rd, 2025

#### Introduction

This Privacy Policy outlines the types of information collected, how it is used, and your rights regarding the Browser Statistics Exporter Extension ("the Extension"). By installing or using the Extension, you agree to this Privacy Policy.

#### Information We Collect 

The Extension collects and transmits statistical data to a remote server specified by the user. The collected data includes:

1. **Tab Statistics**

   - Total number of tabs.
   - Total number of active tabs.
   - Total number of muted tabs.
   - Total number of discarded tabs.
   - Total number of blank tabs.
   - Current tab zoom level.
   - Tab creation, closure, and change event counters.
   - Current active tab ID.

2. **Bookmark Statistics**

   - Total number of bookmarks.
   - Bookmark addition, removal, and modification event counters.

3. **Storage Statistics**

   - Total available bytes.
   - Total existing bytes.

4. **Web Request Statistics**

   - Number of completed web requests.
   - Number of errored web requests.

5. **User Settings**

   - Remote drain URL specified by the user.
   - Unique tracking ID (UUID).

#### Data Usage

The data collected by the Extension is:

- Transmitted to the remote server specified by the user, such as a custom Prometheus pushgateway.
- Used solely for tracking statistics and displaying metrics on platforms like Grafana.

The Extension does not:

- Associate collected data with any personal identifiers other than the UUID.
- Collect browsing history, content of web pages, or any personally identifiable information (PII).

#### Data Storage

The Extension persists the following user-configured settings locally:

- Remote drain URL.
- UUID for tracking purposes.

These settings are stored on the user's device and are not shared unless explicitly configured by the user.

#### Data Sharing

The Extension does not share collected data with third parties. Data is only transmitted to the server URL specified by the user.

#### Your Rights

As a user, you have the following rights:

1. **Data Control**: You can specify the remote server to which data is transmitted. If no server is configured, data will not be transmitted.
2. **Settings Management**: You can modify or delete your settings at any time through the Extension interface.
3. **Opt-Out**: You can uninstall the Extension to stop all data collection and transmission.

#### Security

The Extension takes reasonable measures to protect user data, including:

- Transmitting data only to user-configured remote servers.
- Generating unique UUIDs to avoid collecting personal information.

#### Public Instances

If you use a public instance of the Extension (browser.codaea.com, and others):

- Data transmitted to the public server will include your UUID, which is not linked to any personal identifiers.
- Metrics may be publicly visible if the server owner enables public access.

#### Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted within the Extension or on its associated repository. Continued use of the Extension after changes are posted constitutes your acceptance of the updated policy.

#### Contact

For questions or concerns about this Privacy Policy, please contact: support@codaealab.com

---

By using the Browser Statistics Exporter Extension, you agree to this Privacy Policy.

