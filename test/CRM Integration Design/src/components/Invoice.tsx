import React from 'react';

interface InvoiceData {
  invoiceNumber: string;
  page: string;
  date: string;
  clientCode: string;
  clientName: string;
  clientAddress: string[];
  paymentMethod: string;
  dueDate: string;
  services: {
    description: string;
    htva: number;
    tva: number;
    tvac: number;
  }[];
  totalTvac: number;
  acompte: number;
  resteAPayer: number;
}

interface InvoiceProps {
  data: InvoiceData;
}

export function Invoice({ data }: InvoiceProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">👑</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-yellow-600">LIMOSTAR</h1>
            <p className="text-sm text-gray-600">Just luxury cars</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="bg-gray-200 px-4 py-2 rounded mb-4">
            <span className="font-bold">Facture N° : {data.invoiceNumber}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="border border-gray-300 p-2 text-center">
              <div className="font-bold">PAGE</div>
              <div>{data.page}</div>
            </div>
            <div className="border border-gray-300 p-2 text-center">
              <div className="font-bold">DATE</div>
              <div>{data.date}</div>
            </div>
            <div className="border border-gray-300 p-2 text-center">
              <div className="font-bold">CLIENT</div>
              <div>{data.clientCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <h2 className="font-bold text-lg mb-2">LIMOSTAR</h2>
          <p className="text-sm">65, Avenue Louise</p>
          <p className="text-sm">1050 Brussels</p>
          <p className="text-sm">Belgium</p>
          <p className="text-sm">TVA: BE0888881670</p>
          <p className="text-sm">IBAN: BE94363017450B614</p>
          <p className="text-sm">BIC: BBRUBEBB</p>
        </div>
        
        <div className="w-1/2 text-right">
          <p className="font-bold">{data.clientName}</p>
          {data.clientAddress.map((line, index) => (
            <p key={index} className="text-sm">{line}</p>
          ))}
        </div>
      </div>

      {/* Payment Terms */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-300 p-3 text-center">
          <div className="font-bold bg-gray-100 p-2 mb-2">MODE DE REGLEMENT</div>
          <div>{data.paymentMethod}</div>
        </div>
        <div className="border border-gray-300 p-3 text-center">
          <div className="font-bold bg-gray-100 p-2 mb-2">DATE D'ECHEANCE</div>
          <div>{data.dueDate}</div>
        </div>
        <div className="border border-gray-300 p-3 text-center">
          <div className="font-bold bg-gray-100 p-2 mb-2">TVA</div>
          <div></div>
        </div>
      </div>

      {/* Services Table */}
      <div className="border border-gray-300 mb-6">
        <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300">
          <div className="p-3 font-bold text-center">DESIGNATION</div>
          <div className="p-3 font-bold text-center border-l border-gray-300">H.T.V.A</div>
          <div className="p-3 font-bold text-center border-l border-gray-300">T.V.A</div>
          <div className="p-3 font-bold text-center border-l border-gray-300">T.V.A.C</div>
        </div>
        
        {data.services.map((service, index) => (
          <div key={index} className="grid grid-cols-4 border-b border-gray-300 min-h-32">
            <div className="p-3 text-sm">{service.description}</div>
            <div className="p-3 text-center border-l border-gray-300">{service.htva.toFixed(2)}€</div>
            <div className="p-3 text-center border-l border-gray-300">({service.tva}%) {(service.htva * service.tva / 100).toFixed(2)}€</div>
            <div className="p-3 text-center border-l border-gray-300">{service.tvac.toFixed(2)}€</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-between mb-6">
        <div className="w-1/2">
          <p className="text-sm mb-2">Remarque : www.locationautocar.be by Limostar</p>
          
          <div className="grid grid-cols-3 border border-gray-300 text-center text-sm">
            <div className="p-2 bg-gray-100 border-r border-gray-300 font-bold">TVA</div>
            <div className="p-2 bg-gray-100 border-r border-gray-300 font-bold">BASE</div>
            <div className="p-2 bg-gray-100 font-bold">TVA</div>
            
            {data.services.map((service, index) => (
              <React.Fragment key={index}>
                <div className="p-2 border-r border-gray-300 border-t border-gray-300">{service.htva.toFixed(2)}€</div>
                <div className="p-2 border-r border-gray-300 border-t border-gray-300">{(service.htva * service.tva / 100).toFixed(2)}€</div>
                <div className="p-2 border-t border-gray-300">{service.tvac.toFixed(2)}€</div>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="w-1/3">
          <div className="grid grid-cols-2 border border-gray-300 text-sm">
            <div className="p-2 bg-gray-100 border-r border-gray-300 font-bold">TOTAL TVAC</div>
            <div className="p-2 text-right">{data.totalTvac.toFixed(2)}€</div>
            
            <div className="p-2 bg-gray-100 border-r border-gray-300 border-t border-gray-300 font-bold">ACOMPTE</div>
            <div className="p-2 text-right border-t border-gray-300">{data.acompte.toFixed(2)}€</div>
            
            <div className="p-2 bg-gray-100 border-r border-gray-300 border-t border-gray-300 font-bold">RESTE A PAYER</div>
            <div className="p-2 text-right border-t border-gray-300">{data.resteAPayer.toFixed(2)}€</div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="text-xs text-gray-600 mb-6 space-y-1">
        <p>1. Toutes nos factures sont payables au grand comptant.</p>
        <p>2. Les montants dus devant être virés en euro sur notre compte bancaire de Limostar scs, en mentionnant le numéro de la facture.</p>
        <p>3. En cas de paiement tardif, les sommes dues seront augmentées, de plein droit et sans mise en demeure préalable, d'un intérêt de retard correspondant au taux légal. En outre, une indemnité forfaitaire égal à 15% du montant de la facture, avec un minimum de 40 euros, sera due.</p>
        <p>4. En cas de non-paiement à l'échéance, une indemnité égale à 15% du montant dû sera réclamée pour frais administratifs.</p>
        <p>5. Toutes contestation relative à la facture doit parvenir par courrier recommandé à Limostar scs., Avenue LOUISE 65 BE-1050 Bruxelles, dans les 8 jours qui suivent l'envoi dudit document, faute de quoi la contestation ne pourra en aucun cas être prise en considération. La date de la poste faisant foi.</p>
        <p>6. En cas de contestation persistante, les tribunaux de Bruxelles sont compétents.</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
        <p className="font-bold">LIMOSTAR 65, Avenue Louise 1050 Brussels Belgium</p>
        <p>TEL: +3225129701 - E-mail: info@limostar.be - Site Web: www.limostar.be</p>
      </div>
    </div>
  );
}