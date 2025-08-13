"use client";
import { Info } from "lucide-react";
import { getCategoryById } from "@/lib/polluants";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";

function Tag({ content }: { content: string }) {
  return (
    <div className="bg-yellow-300 py-1 px-3 rounded-2xl w-fit">{content}</div>
  );
}

function ExplicationCard({
  bgColor,
  quesion,
  answer,
}: {
  bgColor: string;
  quesion: string;
  answer: string;
}) {
  return (
    <Card className={`${bgColor} shadow-none rounded-lg`}>
      <CardHeader className="p-4 pb-0">
        <CardDescription className={`rounded-3xl flex items-center gap-1`}>
          <Info />
          {quesion}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">{answer}</CardContent>
    </Card>
  );
}

const categoryExplanations: Record<
  string,
  { title: string; content: React.ReactNode }
> = {
  tous: {
    title: "Tout polluant",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          Les couleurs indiquent l’état de la qualité de l’eau potable vis à vis
          des principaux contaminants chimiques de l’eau pour lesquels des
          données sont disponibles: pesticides, nitrates, PFAS, CVM et
          perchlorate. Les données présentées sont les résultats du contrôle
          sanitaire de l’eau potable réalisé par les Agences Régionales de Santé
          (ARS). La carte “tout polluant” fait la synthèse des résultats pour
          l’ensemble de ces polluants.
        </p>
        <p>La qualité de l’eau est évaluée par rapport :</p>
        <ul className="list-disc ml-6">
          <li>
            <b>Limites de qualité fixées par la réglementation</b> : si ces
            limites sont dépassées, l’eau est déclarée “non conforme”. Un
            dépassement de ces limites indique une dégradation de la qualité de
            l’eau mais ne signifie pas forcément qu’il y ait un risque
            sanitaire. <br />
            * Dans certains cas, l’eau non conforme peut continuer à être
            consommée par l’ensemble de la population. Cette situation est
            indiquée en orange foncée.
            <br />* Lorsqu’un dépassement de la limite de qualité entraîne une
            restriction de la consommation de l’eau, en raison d’un possible
            risque pour la santé, la situation est indiquée en rouge
          </li>
          <li>
            <b>Limites sanitaires recommandées par les autorités de santé</b>.
            Un dépassement d’une limite sanitaire peut entraîner un possible
            risque pour la santé, d’autant plus si le dépassement est prolongé.
            L’eau est donc déconseillée à la consommation, par précaution, pour
            toute ou partie de la population. Cette situation est indiquée en
            rouge.
          </li>
        </ul>
        <Tag content="Ce que la carte ne montre pas" />
        <p>
          D’autres substances chimiques sont susceptibles d’être présentes dans
          l’eau (comme des résidus de médicaments) mais les mesures réalisées
          par les ARS sur ces substances sont trop peu nombreuses ou
          inexistantes, et ne figurent donc pas sur la carte.
        </p>
        <p>
          Cette carte n’indique pas les résultats des analyses réalisées par les
          personnes responsables de la production et de la distribution de
          l’eau.
        </p>
        <p>
          Cette carte ne présente pas la qualité microbiologique ou radiologique
          de l’eau.
        </p>
        <p>
          Pour plus d’explications sur le contrôle sanitaire de l’eau potable,
          voir ici.
        </p>
      </>
    ),
  },
  pesticide: {
    title: "Pesticides",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “pesticides” indique les résultats d’analyses obtenus pour
          les <b>substances actives</b> chimiques contenues dans les produits
          phytosanitaires (utilisés en agriculture) ou biocides (utilisés à
          domicile ou dans les bâtiments) ainsi que leurs produits de
          dégradation, appelés <b>métabolites</b>.
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des pesticides dans mon eau ?" />
        <p>
          La présence de pesticides dans l’eau des captages (cours d’eau ou eaux
          souterraines) est due à leur entraînement par ruissellement ou à leur
          infiltration dans les sols. Les techniques utilisées pour la
          production d’eau potable ne permettent pas d’éliminer totalement les
          pesticides.
        </p>
        <Tag content="Quelles limites pour les pesticides dans l’eau ?" />
        <p>
          Il existe 2 limites de qualité réglementaires pour les pesticides. Si
          elles sont dépassées, l’eau est déclarée “non conforme” :
        </p>
        <ul className="list-disc ml-6">
          <li>
            0,1 µg/L pour chaque substance active et métabolites dits
            “pertinents”
          </li>
          <li>
            0,5 µg/L pour la somme des substance actives et métabolites
            pertinents (paramètre “total pesticide”)
          </li>
        </ul>
        <p>
          Pour les métabolites dits “non pertinents”, une valeur dite
          “indicative” de 0.9 µg/L s’applique.
        </p>
        <p>
          Pour certaines substances ou métabolites pertinents, les autorités ont
          fixé des valeurs sanitaires maximales (Vmax), correspondant aux
          concentrations maximales dans l’eau ne présentant pas de risque pour
          la santé du consommateur.
        </p>
        <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
        <p>
          Un dépassement des limites réglementaires ou indicatives indique une
          dégradation de la qualité de l’eau mais ne signifie pas qu’il y ait un
          risque sanitaire. L’eau peut continuer à être consommée par l’ensemble
          de la population si la concentration reste inférieure aux valeurs
          sanitaires. En cas de dépassement d’une Vmax, l’eau doit être
          restreinte à la consommation.
        </p>
        <p>
          L’eau potable contaminée contribue à l’exposition de la population
          générale aux pesticides mais l’alimentation reste la principale source
          d’exposition. La part de l’eau potable dans l’exposition est estimée
          entre 5 et 10%. Le meilleur moyen pour diminuer son exposition aux
          pesticides est donc de manger bio le plus possible.
        </p>
      </>
    ),
  },
  sub_active: {
    title: "Substances actives",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “substance actives” indique les résultats d’analyse obtenus
          pour les <b>substances actives</b> chimiques contenues dans les
          produits phytosanitaires (utilisés en agriculture) ou biocides
          (utilisés à domicile ou dans les bâtiments). Ces substances ont
          majoritairement des propriétés herbicides, insecticides ou fongicides.
          Cette carte n’indique pas les résultats obtenus pour les métabolites
          ni pour le total pesticide.
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des pesticides dans mon eau ?" />
        <p>
          La présence de pesticides dans l’eau des captages (cours d’eau ou eaux
          souterraines) est due à leur entraînement par ruissellement ou à leur
          infiltration dans les sols. Les techniques utilisées pour la
          production d’eau potable ne permettent pas d’éliminer totalement les
          pesticides. Certaines substances sont très persistantes dans
          l'environnement et se retrouvent dans l’eau potable, même plusieurs
          années après leur interdiction, comme l’atrazine interdite depuis
          2003.
        </p>
        <Tag content="Quelles limites réglementaires pour les pesticides dans l’eau ?" />
        <p>
          La limite de qualité réglementaire est fixée à 0,1 µg/L pour chaque
          substance active. Pour certaines substances actives, les autorités ont
          fixé des valeurs sanitaires maximales (Vmax) en se basant sur des
          données toxicologiques. Ces valeurs correspondent aux concentrations
          maximales dans l’eau ne présentant pas de risque pour la santé du
          consommateur.
        </p>
        <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
        <p>
          Un dépassement des limites réglementaires indique une dégradation de
          la qualité de l’eau mais ne signifie pas qu’il y ait un risque
          sanitaire. L’eau peut continuer à être consommée par l’ensemble de la
          population si la concentration reste inférieure aux valeurs
          sanitaires. En cas de dépassement d’une Vmax, les autorités
          restreignent par précaution la consommation de l’eau.
        </p>
        <p>
          L’eau potable contaminée contribue à l’exposition de la population
          générale aux pesticides mais l’alimentation reste la principale source
          d’exposition. La part de l’eau potable dans l’exposition est estimée
          entre 5 et 10%. Le meilleur moyen pour diminuer son exposition aux
          pesticides est donc de manger bio le plus possible.
        </p>
      </>
    ),
  },
  metabolite: {
    title: "Métabolites",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “métabolites” indique les résultats d’analyse obtenus pour
          les métabolites de pesticides. Les métabolites sont des substances
          chimiques issues de la dégradation des pesticides dans
          l’environnement. Cette carte n’indique pas les résultats obtenus pour
          les substances actives ni pour le total pesticide. Il nous a paru
          nécessaire d’afficher sur 2 cartes distinctes les résultats pour les
          substances actives et les métabolites afin de souligner que la
          contamination de l’eau potable par les pesticides est en grande
          majorité due à la présence de métabolites.
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des métabolites dans mon eau ?" />
        <p>
          Après leur application, les substances actives pesticides peuvent se
          dégrader dans les milieux par des processus biologiques ou physiques
          en un ou plusieurs métabolites. Certains métabolites, sont très
          solubles dans l’eau et ont la capacité de s’infiltrer dans les sols et
          de contaminer les nappes phréatiques. Les métabolites persistants
          peuvent se retrouver dans l’eau potable même après l’interdiction de
          la substance active dont ils sont issus.
        </p>
        <Tag content="Quelles limites pour les métabolites dans l’eau ?" />
        <p>
          La limite de qualité réglementaire est fixée à 0,1 µg/L pour chaque
          métabolite “pertinent” ainsi que pour les métabolites dont la
          pertinence n’a pas été évaluée.
        </p>
        <p>
          Pour les métabolites dits “non pertinents”, une valeur dite
          “indicative” de 0.9 µg/L s’applique.
        </p>
        <p>
          Pour certains métabolites, une valeur sanitaire (appelée Vmax) a été
          établie par l’Anses sur la base de données toxicologiques.
        </p>
        <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
        <p>
          Un dépassement des limites réglementaires indique une dégradation de
          la qualité de l’eau mais ne signifie pas qu’il y ait un risque
          sanitaire. L’eau peut continuer à être consommée par l’ensemble de la
          population. En cas de dépassement des limites sanitaires, les
          autorités restreignent par précaution la consommation de l’eau.
        </p>
        <p>
          L’alimentation est la principale source d’exposition aux pesticides
          pour la population générale. La part de l’eau potable dans
          l’exposition de la population est estimée entre 5% et 10%. Le meilleur
          moyen pour diminuer son exposition aux pesticides est donc de manger
          bio le plus possible.
        </p>
      </>
    ),
  },
  nitrate: {
    title: "Nitrates",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “nitrates” indique les résultats d’analyse obtenus pour les
          nitrates (NO3-) et les nitrites (NO2-). Les nitrates et les nitrites
          sont une des formes de l’azote, élément essentiel à la croissance des
          plantes. Il sont présents naturellement dans l’environnement mais
          l’agriculture est à l’origine de 88 % des nitrates contenus dans les
          eaux.
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des nitrates dans mon eau ?" />
        <p>
          La présence des nitrates dans l’eau potable est due à une
          contamination de la ressource majoritairement causée par des activités
          agricoles (usage excessif d’engrais azoté, effluents d'élevage).
        </p>
        <Tag content="Quelles limites pour les nitrates dans l’eau ?" />
        <p>
          La limite de qualité réglementaire est fixée à 50 mg/L pour les
          nitrates et 0.5 mg/L pour les nitrites. Des dépassements chroniques de
          la limite de 50 mg/L pour les nitrates sont constatés dans plusieurs
          régions. Le 21 février 2025, la Commission européenne a attaqué la
          France en justice pour non-respect de cette limite dans 107 unités de
          distribution (UDI) et pour ne pas avoir suffisamment informé les
          consommateurs.
        </p>
        <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
        <p>
          En cas de dépassement des limites réglementaires, des risques pour la
          santé sont possibles, en particulier si la durée du dépassement est
          prolongée. Les femmes enceintes et les nourrissons sont les plus
          sensibles.
        </p>
        <p>
          Dans l’organisme humain, les nitrates se transforment en nitrites. Ces
          derniers peuvent provoquer la formation de « méthémoglobine », une
          forme d’hémoglobine incapable de transporter correctement l’oxygène.
          Chez les nourrissons, cette maladie appelée méthémoglobinémie provoque
          des cyanoses parfois sévères.
        </p>
        <p>
          Pour prévenir ces risques de méthémoglobinémie, l’eau est déconseillée
          à la consommation pour les femmes enceintes et les nourrissons si la
          limite de 50 mg/L est dépassée. Au-delà de 100 mg/L, toute la
          population est concernée par la restriction de consommation.
        </p>
      </>
    ),
  },
  pfas: {
    title: "PFAS",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          Les PFAS sont une famille de plusieurs milliers de substances
          fabriquées par l’homme qui ont comme caractéristique commune d’être
          très persistantes dans l’environnement. Elles sont utilisées depuis
          les années 1950 dans de nombreux secteurs d’activités en raison de
          leurs propriétés (antiadhésives, antitaches, résistance aux fortes
          chaleurs…)
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des PFAS dans mon eau ?" />
        <p>
          En raison de leur utilisation importante et de leur persistance, on
          retrouve des PFAS dans tous les compartiments de l’environnement, et
          donc aussi dans les captages servant à la production d’eau potable. La
          surveillance des PFAS dans l’eau potable n’est pas encore obligatoire.
          Elle le deviendra au plus tard le 12 janvier 2026, comme le prévoit la
          réglementation européenne. C’est pourquoi les données sont encore
          manquantes pour de nombreux endroits.
        </p>
        <Tag content="Quelles limites réglementaires pour les PFAS dans l’eau ?" />
        <p>
          La France applique la limite réglementaire fixée par l’Europe de 0,1
          µg/L pour la somme de 20 PFAS. Cette limite est remise en question par
          la communauté scientifique car elle ne serait pas assez protectrice.
          Plusieurs pays appliquent déjà des limites plus faibles. En attendant
          l’établissements de valeurs sanitaires, basées sur les données
          toxicologiques les plus récentes, le Haut Conseil pour la Santé
          Publique (HSCP) recommande d’appliquer également la limite de 0,02
          µg/L pour la somme des 4 PFAS les plus préoccupants (PFOA, PFOS, PFNA
          et PFHxS). C’est pourquoi nous avons choisi d’indiquer sur la carte
          les zones qui dépassent cette valeur.
        </p>
        <p>
          Si cette limite est dépassée, l’eau est déclarée non conforme et des
          mesures doivent être prises pour abaisser les concentrations de PFAS
          dans l’eau. Selon les situations, les autorités sanitaires peuvent
          restreindre la consommation de l’eau mais ce n’est pas systématique.
        </p>
        <p>
          Certains PFAS font l’objet de préoccupations en raison de leurs effets
          néfastes sur la santé: une exposition aux PFAS a été associée à des
          troubles du système immunitaire, une augmentation du cholestérol, un
          faible poids à la naissance ou à une augmentation du risque de
          certains cancers (rein, sein).
        </p>
        <p>
          Les principales sources d’exposition pour l’homme sont l’alimentation
          (produits de la mer, viande, œuf) et l’eau potable.
        </p>
        <p>Plus d’explications sur les PFAS ici.</p>
      </>
    ),
  },
  cvm: {
    title: "CVM",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “CVM” indique les résultats d’analyse obtenus pour le
          Chlorure de Vinyl Monomère.
        </p>
        {/* TODO: Add more content for CVM when available */}
      </>
    ),
  },
  sub_indus_perchlorate: {
    title: "Perchlorates",
    content: (
      <>
        <Tag content="Que montre la carte ?" />
        <p>
          La carte “perchlorate” indique les résultats d’analyse obtenus pour
          l’ion perchlorate (ClO4), principalement présent dans l’environnement
          sous forme de sels, (perchlorate d'ammonium, de potassium, de
          magnésium, ou de sodium). Ces divers sels peuvent être utilisés dans
          de nombreuses applications industrielles, en particulier dans les
          domaines militaires, aérospatiales (propulseurs de fusées, dispositifs
          pyrotechniques, poudres d’armes à feu…) et agricoles.
        </p>
        <Tag content="Pourquoi est-ce qu’il y a des perchlorates dans mon eau ?" />
        <p>
          Les perchlorates peuvent se retrouver dans l’environnement du fait de
          rejets industriels, d’utilisations militaires et de leur présence dans
          des engrais. Les ions perchlorate étant très stables et très solubles
          dans l’eau, ils peuvent rester présents dans l’eau, une fois émis,
          pendant des dizaines d’années.
        </p>
        <p>
          La présence de perchlorates dans les communes du Nord Pas de Calais,
          de Picardie et de Champagne Ardennes, laisse présager d’un possible
          lien avec les zones ayant fait l’objet de combats pendant la première
          guerre mondiale. Cette hypothèse reste cependant à confirmer.
        </p>
        <Tag content="Quelles limites pour les perchlorates dans l’eau ?" />
        <p>
          Il n’existe pas de limite réglementaire pour les perchlorates dans
          l’eau potable. Il n’y a pas non plus obligation de les rechercher. Sur
          la base de plusieurs avis de l’agence de sécurité sanitaire (Anses),
          le ministère de la santé recommande, par principe de précaution, de :
        </p>
        <ul className="list-disc ml-6">
          <li>
            limiter l’utilisation d’eau dont la teneur en ions perchlorate
            dépasse 4 µg/L pour la préparation des biberons des nourrissons de
            moins de 6 mois
          </li>
          <li>
            limiter la consommation d’eau dont la teneur en ions perchlorate
            dépasse 15 µg/L pour les femmes enceintes et allaitantes (protégeant
            ainsi fœtus et nourrissons)
          </li>
        </ul>
        <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
        <p>
          En cas de dépassement des limites préconisées par l’Anses, il est
          préférable pour les nourrissons et les femmes enceintes de ne pas
          consommer l’eau, afin de prévenir tout risque pour la thyroïde. Les
          perchlorates interfèrent avec le processus d’incorporation de l’iode
          par la thyroïde. ils peuvent donc induire une diminution dans la
          synthèse des hormones thyroïdiennes (TSH).
        </p>
        <p>
          <b>
            L’Anses dans son avis du 20 juillet 2012 conclut qu’au vu des
            données disponibles à ce jour, un dépassement modéré de la valeur de
            15 µg/L chez l’adulte, notamment chez la femme enceinte, et de 4
            µg/L chez le nouveau-né ne semble pas associé à des effets
            cliniquement décelables.
          </b>
        </p>
      </>
    ),
  },
};

export default function PollutionSidePanel({
  category,
  onClose,
}: {
  category: string;
  onClose?: () => void;
}) {
  const categoryDetails = getCategoryById(category);
  const explanation = categoryExplanations[category];

  return (
    <div className="h-full flex flex-col relative">
      <button
        className="absolute top-5 right-5 text-black bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300"
        onClick={() => onClose?.()}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {categoryDetails === undefined ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Aucune donnée disponible</span>
        </div>
      ) : (
        <>
          <div className="text-black p-4">
            <div className="text-xs font-thin">FICHE EXPLICATIVE</div>
            <div className="text-2xl">
              {(categoryDetails.nomAffichage || "UNKOWN").toUpperCase()}
            </div>
          </div>
          <div className="bg-white p-4 flex flex-col gap-4 rounded-t-lg flex-1 overflow-y-auto">
            <div className="text-black  pt-4">
              {categoryDetails.description || ""}
            </div>
            {explanation && (
              <div className="text-black pt-4 space-y-4">
                {explanation.content}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
