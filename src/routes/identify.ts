import { Router } from "express";
import { AppDataSource } from "../../ormconfig";
import { Contact } from "../entity/contact";

const identifyRouter = Router();

identifyRouter.post("/", async (req, res) => {

  let { email, phoneNumber } = req.body;

  if(email.toLowerCase()=="null" || !email){
  email=null;
}
if(phoneNumber.toLowerCase()=="null" || !phoneNumber){
  phoneNumber=null;
}
  
  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ message: "Both Email and phoneNumber can not be NULL together." });
  }


  const contactRepository = AppDataSource.getRepository(Contact);

  let mC:Contact[]=[]
  if(phoneNumber=="null" || email=="null"){
    if (email) {
      // Only email provided
      mC = await contactRepository.find({
        where: { email },
        order: { createdAt: "ASC" }, // Order by creation date
      });
    } else if (phoneNumber) {
      // Only phoneNumber provided
      mC = await contactRepository.find({
        where: { phoneNumber },
        order: { createdAt: "ASC" }, // Order by creation date
      });
    }
  }

  
  // Find all contacts matching either email or phoneNumber
  let matchingContacts:Contact[]=[];

  if (email && phoneNumber) {
    // Both email and phoneNumber provided
    matchingContacts = await contactRepository.find({
      where: [{ email }, { phoneNumber }],
      order: { createdAt: "ASC" }, // Order by creation date
    });
  } else if (email) {
    // Only email provided
    matchingContacts = await contactRepository.find({
      where: { email },
      order: { createdAt: "ASC" }, // Order by creation date
    });
  } else if (phoneNumber) {
    // Only phoneNumber provided
    matchingContacts = await contactRepository.find({
      where: { phoneNumber },
      order: { createdAt: "ASC" }, // Order by creation date
    });
  }
  if(mC.length>0){
  
   matchingContacts=mC; 
  }
  if (matchingContacts.length === 0 && phoneNumber!=null && email!=null) {
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
  if (!alreadyLinked && email!=null && phoneNumber!=null) {
    const newContact = contactRepository.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    });
    await contactRepository.save(newContact);
  }
 

  // Fetch updated list of contacts
  const allLinkedContacts =primaryContact? await contactRepository.find({
    where: [{ linkedId: primaryContact.id }, { id: primaryContact.id }],
  }):[];

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
      primaryContatctId: primaryContact?primaryContact.id:"no id found",
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  });
});

export default identifyRouter;
