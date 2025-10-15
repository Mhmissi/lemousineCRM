import { Invoice } from './components/Invoice';

// Sample data matching the invoice from the image
const sampleInvoiceData = {
  invoiceNumber: "FC3363",
  page: "1",
  date: "2025-09-19",
  clientCode: "CL1591",
  clientName: "Ecole Jacques Brel",
  clientAddress: [
    "Rue Esseghem 101",
    "1090 Jette"
  ],
  paymentMethod: "Virement",
  dueDate: "2025-09-22",
  services: [
    {
      description: "Autocar de 52 places pour un trajet aller/retour au départ de Jette le 26 septembre 2025 pour 46 enfants et 4 accompagnateurs.\n\nDépart : Bh sur le parking de la salle Omnisport de Jette, avenue du Comte de Jette 3 - 1090.\nDestination : Château de Moha, rue du Mardel 101A, 4520 Wanze.\nRetour pour 17h30.",
      htva: 900.00,
      tva: 6,
      tvac: 954.00
    }
  ],
  totalTvac: 954.00,
  acompte: 0.00,
  resteAPayer: 954.00
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Invoice data={sampleInvoiceData} />
    </div>
  );
}