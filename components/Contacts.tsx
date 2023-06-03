import { Text, Button } from '@vercel/examples-ui';
import { useState } from 'react';

type Contact = {
  id: number;
  name: string;
  publicKey: string;
};

const contacts: Contact[] = [
  { id: 1, name: 'Armando Terrazas', publicKey: '0x1234567890abcdef' },
  { id: 2, name: 'Daniel Munos', publicKey: '0x0987654321fedcba' },
  { id: 3, name: 'Ines Garcia', publicKey: '0xabcdef0987654321' },
  // Add more contacts as needed
];

function Contacts() {
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  const copyToClipboard = (publicKey: string) => {
    navigator.clipboard.writeText(publicKey);
    setCopiedContact(publicKey);
    setTimeout(() => {
      setCopiedContact(null);
    }, 3000);
  };

  const handleManageContacts = () => {
    console.log('Managing all contacts');
  };

  const handleCreateContact = () => {
    console.log('Creating a new contact');
  };

  return (
    <div className="flex flex-col py-4 px-2 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <Text variant="h2" className="text-white">
          Contacts
        </Text>
      </div>
      <ul className="list-none flex-grow overflow-auto">
        {contacts.map((contact) => (
          <li key={contact.id} className="py-2 flex w-full">
            <button
              className="px-4 py-1 text-gray-200 rounded w-full text-left hover:bg-slate-400 hover:text-slate-900 focus:outline-none"
              onClick={() => copyToClipboard(contact.publicKey)}
            >
              {contact.name}
            </button>
            {copiedContact === contact.publicKey && (
              <span className="text-green-500 ml-2">Copied!</span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-col w-full items-center">
        <div className="flex-grow" /> {/* Spacer to push the buttons to the bottom */}
        <div className="flex flex-col justify-center w-full items-center">
          <Button onClick={handleManageContacts} className="my-4 w-full">
            Manage Contacts
          </Button>
          <Button onClick={handleCreateContact} className="w-full" variant="secondary">
            Create Contact
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Contacts;