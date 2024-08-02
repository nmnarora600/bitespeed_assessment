import { Router } from "express";
import { AppDataSource } from "../../ormconfig";
import { Contact } from "../entity/contact";

const identifyRouter = Router();

identifyRouter.post("/", async (req, res) => {
  const { email, phoneNumber } = req.body;
  console.log("req received for ", email, phoneNumber);
  if (!email || !phoneNumber) {
    return res
      .status(400)
      .json({ message: "Both Email and phoneNumber are required." });
  }

  const contactRepository = AppDataSource.getRepository(Contact);

  // Find all contacts matching either email or phoneNumber
  const matchingContacts = await contactRepository.find({
    where: [{ email }, { phoneNumber }],
    order: { createdAt: "ASC" }, // Order by creation date
  });

  if (matchingContacts.length === 0) {
    // No matching contacts, create a new primary contact
    const newContact = contactRepository.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
    });
    const savedContact = await contactRepository.save(newContact);

    return res.json({
      contact: {
        primaryContatctId: savedContact.id,
        emails: [savedContact.email],
        phoneNumbers: [savedContact.phoneNumber],
        secondaryContactIds: [],
      },
    });
  }

  // Determine the primary contact
  let primaryContact = matchingContacts.find(
    (contact) => contact.linkPrecedence === "primary"
  );

  if (!primaryContact) {
    primaryContact = matchingContacts[0]; // First contact in the list
  }

  // Handle conflict by setting later primary contact to secondary
  for (const contact of matchingContacts) {
    if (contact.id !== primaryContact.id) {
      contact.linkPrecedence = "secondary";
      contact.linkedId = primaryContact.id;
      await contactRepository.save(contact);
    }
  }

  // Handle new secondary contact creation if not already linked
  const alreadyLinked = matchingContacts.some(
    (contact) => contact.email === email && contact.phoneNumber === phoneNumber
  );
  if (!alreadyLinked) {
    const newContact = contactRepository.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    });
    await contactRepository.save(newContact);
  }

  // Fetch updated list of contacts
  const allLinkedContacts = await contactRepository.find({
    where: [{ linkedId: primaryContact.id }, { id: primaryContact.id }],
  });

  const emails = Array.from(
    new Set(allLinkedContacts.map((contact) => contact.email).filter(Boolean))
  );
  const phoneNumbers = Array.from(
    new Set(
      allLinkedContacts.map((contact) => contact.phoneNumber).filter(Boolean)
    )
  );
  const secondaryContactIds = allLinkedContacts
    .filter((contact) => contact.linkPrecedence === "secondary")
    .map((contact) => contact.id);

  return res.json({
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  });
});

export default identifyRouter;
