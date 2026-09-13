export const tsunamiContent = {
  title: "A hospital needs to be heard.",
  subtitle: "26 December 2004 · Northern Sumatra, Indonesia",
  introduction:
    "An earthquake off Sumatra sends a tsunami across the Indian Ocean. Families need care. Hospitals need to coordinate. Take the radio operator's seat and get one hospital's request through.",
  historyNote:
    "ORARI, Indonesia's amateur radio organisation, set up emergency posts at Melati Hospital in Perbaungan and Adam Malik Hospital in Medan. Patients were transferred to Adam Malik. The response used VHF repeaters. This diagram reconstructs a possible communication route between those real posts; it is not a recorded circuit or a map to scale.",
  message:
    "Adam Malik, this is Melati Hospital. Request transport coordination for patients needing further care. Please confirm receipt and advise availability. Over.",
  acknowledgement:
    "Melati Hospital, Adam Malik received your request for transport coordination. We will check availability. Stand by for an update.",
  completion:
    "The receiving hospital now knows what is needed. A reply closes the communication loop. Transport still has to be arranged, and care still has to be delivered. Your radio made that coordination possible.",
  ui: {
    eyebrow: "ONE MESSAGE / A TRUE STORY / 2 MINUTES",
    diagramTitle: "Two hospitals. A way to reach each other.",
    diagramDescription:
      "A schematic of Melati Hospital, a working radio repeater and Adam Malik Hospital. The failed phone route is separate from the radio route. A request goes out and an acknowledgement comes back.",
    schematicNote:
      "Real hospital posts · reconstructed route and outage · not to scale",
    blackoutTitle: "Someone is waiting for an answer.",
    blackoutBody:
      "Imagine helping at a hospital after the tsunami. Patients need further care. Before another team can coordinate transport, they need to hear your request.",
    equipmentTitle: "Give the message a way out.",
    equipmentBody:
      "For this exercise, mains power and the phone route are down. A prepared radio station and a working repeater are available. Choose how to power the station and reach the other operator.",
    messageTitle: "What should the other hospital hear?",
    messageBody:
      "The link is open. Send a message that identifies your hospital, states the need and asks for confirmation. These sample messages are fictional.",
    acknowledgedTitle: "You are heard.",
    lessonTitle: "A hobby practised before the emergency.",
    lessonBody:
      "When a familiar way to communicate fails, prepared volunteers can provide another. Practising with radios, arranging independent power and knowing how to pass a clear message gives that backup a chance to work.",
    vagueMessage: "We need help. Can anyone hear us?",
    clearMessage: "Name the hospital. State the need. Ask for confirmation.",
    limitation:
      "This is a scripted communication exercise, not a radio coverage calculation. Acknowledgement confirms receipt, not the arrival of help.",
  },
  explainers: [
    {
      title: "What actually happened",
      body: "On 26 December 2004, a magnitude 9.1 earthquake off Sumatra generated the Indian Ocean tsunami. The disaster damaged communication infrastructure in Aceh.",
    },
    {
      title: "People connected hospitals",
      body: "In January, operators at Meulaboh's Cut Nyak Dhien Hospital used a wire antenna supported by bamboo. They contacted Banda Aceh and Medan for medical staff, medicines and equipment.",
    },
    {
      title: "Why amateur radio?",
      body: "Amateur means licensed people who practise radio outside commercial broadcasting. A prepared station can use its own power and communicate without a phone provider. Operators, working equipment and a usable radio path are still essential.",
    },
    {
      title: "The reply matters",
      body: "Pressing transmit only means you sent something. An acknowledgement tells you it was received. A clear request gives the other team something they can act on.",
    },
  ],
  sources: [
    {
      title: "Wyn W. Purwinto, AB2QV · ORARI response account",
      url: "https://www.qsl.net/ab2qv/ares-tsunami.htm",
      note: "Contemporary operator report with ORARI contributors. Documents the hospital posts, repeaters, transfers and later Aceh hospital requests. Hospital spellings vary in the account.",
    },
    {
      title: "USGS · The 2004 Sumatra–Andaman earthquake",
      url: "https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake",
      note: "Geological source for the date, magnitude and tsunami generation.",
    },
  ],
  modelNote:
    "Educational reconstruction. The outage at these two posts, battery choice, route, messages and reply are invented teaching conditions. The exercise assumes a powered, reachable repeater and compatible radios with trained operators. It does not calculate radio coverage or reproduce historical traffic. Amateur radio was one part of a wider relief response.",
  feedback: {
    start:
      "The request is waiting. Choose a power source and a way to reach the other hospital.",
    grid: "The mains supply is unavailable in this exercise. The radio needs an independent power source.",
    phone:
      "The phone route is unavailable in this exercise. Use the prepared radio network to reach the receiving operator.",
    connected:
      "Both operators can hear each other through the working repeater. Now make the request clear.",
    vague:
      "The receiving operator needs to know who is calling and what help is requested. Try the message with a hospital name, a specific need and a request for confirmation.",
    acknowledged:
      "Request received and acknowledged. The receiving team can now check transport availability.",
  },
} as const;
