# Hospitals across Aceh and North Sumatra

The level covers December 2004 through January 2005. It maps the hospital radio sites named in the operational accounts, plus their coordination hubs. It is not an exhaustive census of damaged hospitals. A receiving hospital is not necessarily a damaged hospital.

## Evidence model

`hospital-network.ts` separates hospital, emergency-hospital and coordination nodes. It distinguishes reported radio contacts from a patient-transfer connection. Stations without established individual contacts remain visible without invented connecting lines.

The primary network source is [Wyn Purwinto's ORARI contributor account](https://www.qsl.net/ab2qv/ares-tsunami.htm), with a separate [April 2005 ORARI bulletin](https://ftp.unpad.ac.id/orari/orari-diklat/BeON/beon0411.pdf) supporting Cut Meutia's hospital base and communications with Medan. Callsign spellings follow those accounts. The first account inconsistently reuses YB6ZAK elsewhere; the level uses it only for the documented Meulaboh hospital station.

The Melati–Adam Malik line represents reported patient movement. It is not evidence of an uninterrupted direct radio circuit between those hospitals. Medan's Polonia net-control station and the Banda-area airbase/coastal stations are not hospital buildings.

## Radio techniques

Sources establish HF operation, local VHF coordination, repeaters and human message handling. They do not establish exact modulation settings, transmitter wattages or a surveyed repeater chain for every depicted contact. The simulation uses SSB for HF and FM for VHF as disclosed assumptions. The controls do not replay historical measurements.

[JS8Call's official history](https://js8call.com/JS8Call-improved/d6/d14/md_docs_2user__guide_2JS8Call__User__Guide.html) dates initial development releases to July 2018 and public version 1.0 to April 2019. It was unavailable in 2004–2005. FT8 controls are also modern educational comparisons.

## Geography and local detail

The regional coastline uses the existing bundled Natural Earth geometry. Some pins represent towns or broad areas because the source does not establish a 2005 street address. Nias is an island-level marker with an unspecified hospital identity. Modern coordinates locate known permanent hospitals where available; they do not verify unchanged building footprints since 2005.

[Indonesia's Ministry of Health](https://ditmutunakes.kemkes.go.id/index.php/detail-institusi/rsup-h-adam-malik/4d54417a) supplies the modern Adam Malik reference. [OpenStreetMap node 9791489808](https://www.openstreetmap.org/node/9791489808) locates modern Melati. Local terrain snapshots have their own source metadata and attribution. Streets and footprints from those snapshots are modern reference data, not historical reconstruction. Building heights and the flat ground plane are display assumptions, not surveyed elevation data.

The small globe illustrates rounded great-circle distance. The drawn geographic arc is not a road, an evacuation flight record or a simulated RF ray. Radio-path geometry comes only from the RF engine. Local building geometry does not currently enter the engine's terrain model.

## Human significance

[VOA's tsunami family-contact report](https://www.voanews.com/a/a-13-2005-01-05-voa24-66363817/546509.html) describes Sanchita Saha learning through amateur operators that her husband was alive in a Port Blair camp. This is an Indian example from the wider disaster. It supports restored contact, not a documented physical reunion at an Indonesian hospital.

The sample message is fictional. Successful simulation means a voice-capable path and its return path are available under the model. It does not establish delivery of supplies, patient transport or physical reunion. Return checks assume equal transmit power and receiver bandwidth/noise figure at both ends.

## Verification route

1. Open When Phones Fail on the integration branch. Inspect regional hospital pins, coordination hubs and the patient-transfer legend.
2. Select Meulaboh–Medan. Open the distance inset and compare the selected geographic endpoints.
3. Select Local terrain and inspect a supported hospital's modern mapped surroundings. Zoom to individual buildings and reset the view.
4. Try VHF on the regional route. Increase power; the model should still report the horizon limitation.
5. Switch to 7.055 MHz HF and SEND IT. Inspect the engine path and return-link status. Changing either endpoint or any radio setting must clear the previous message result.
6. Compare a tenfold power change. Received power should change by 10 dB for an otherwise identical setup.
7. Check the geographic and local views in POTATO mode and at narrow viewport widths.
