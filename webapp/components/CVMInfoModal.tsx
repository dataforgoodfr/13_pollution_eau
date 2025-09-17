"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CVMInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CVMInfoModal({
  open,
  onOpenChange,
}: CVMInfoModalProps) {
  const handleOk = () => {
    sessionStorage.setItem("cvmModalShown", "true");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      sessionStorage.setItem("cvmModalShown", "true");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Information importante sur les données CVM</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Les données présentées sur cette carte sont celles rendues
            disponibles par les Agences Régionales de Santé (ARS) et le
            Ministère de la Santé. Cependant, concernant le CVM, le Ministère de
            la Santé ne partage pas toutes les données disponibles: environ ¼
            seulement des cas de non conformité recensés par les ARS sont rendus
            publics.
          </p>

          <p>
            <strong>
              Les informations affichées sur la carte sont donc largement
              incomplètes et à lire avec prudence
            </strong>
            : une UDI indiquée comme respectant la limite réglementaire peut en
            réalité être concernée par un dépassement de cette limite.
          </p>

          <p>
            Nous travaillons actuellement à l&apos;intégration de données plus
            complètes, obtenues auprès des ARS par le doctorant Gaspard Lemaire,
            à l&apos;origine de l&apos;alerte sur le CVM dans l&apos;eau
            potable.
          </p>

          <p>
            En attendant, vous pouvez consulter{" "}
            <a
              href="https://vert.eco/articles/leau-potable-de-votre-commune-est-elle-contaminee-au-cvm-ce-gaz-toxique-et-cancerogene-verifiez-sur-notre-carte-de-france-interactive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              la carte publiée par le média Vert
            </a>{" "}
            qui indique les communes rattachées à un réseau pour lequel au moins
            1 dépassement de la limite réglementaire a été constaté entre 2014
            et 2024.
          </p>

          <p>
            <strong>
              La contamination de l&apos;eau par le CVM étant un phénomène très
              localisé, concernant quelques tronçons uniquement d&apos;un réseau
              de distribution, nous vous conseillons de contacter votre mairie
              pour savoir si votre logement est concerné par un dépassement de
              la limite de qualité.
            </strong>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleOk} className="w-full sm:w-auto">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
