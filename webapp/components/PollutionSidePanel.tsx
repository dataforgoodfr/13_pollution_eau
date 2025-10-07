"use client";
// import { Info } from "lucide-react";
import { getCategoryById } from "@/lib/polluants";
// import {
//   Card,
//   CardHeader,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
import { X } from "lucide-react";

function Tag({ content }: { content: string }) {
  return (
    <div className="bg-[#8dbe5a] py-1 px-3 rounded-2xl w-fit">{content}</div>
  );
}

// function ExplicationCard({
//   bgColor,
//   quesion,
//   answer,
// }: {
//   bgColor: string;
//   quesion: string;
//   answer: string;
// }) {
//   return (
//     <Card className={`${bgColor} shadow-none rounded-lg`}>
//       <CardHeader className="p-4 pb-0">
//         <CardDescription className={`rounded-3xl flex items-center gap-1`}>
//           <Info />
//           {quesion}
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-4 pt-2">{answer}</CardContent>
//     </Card>
//   );
// }

const getCategoryExplanation = (
  category: string,
  period: string,
): { title: string; content: React.ReactNode } | undefined => {
  const isBilanAnnuel = period.startsWith("bilan_annuel_");

  const explanations: Record<
    string,
    { title: string; content: React.ReactNode }
  > = {
    tous: {
      title: "Tous polluants",
      content: (
        <>
          <p>
            Les cartes &quot;tous polluants&quot; indiquent l&apos;état de la
            qualité de l&apos;eau potable vis à vis des principaux polluants
            chimiques que nous avons choisi de traiter:{" "}
            <b>pesticides, nitrates, PFAS, CVM et perchlorates</b>. Des cartes
            spécifiques à chaque polluant sont aussi consultables.
          </p>
          <p>
            Les données sont issues du contrôle sanitaire réalisé par par les
            Agences Régionales de Santé (ARS) et sont présentées pour chaque
            réseau de distribution de l&apos;eau (appelé UDI, unité de
            distribution) pour la France Métropolitaine. Pour les DROM, les
            données sont présentées par communes.
          </p>

          {!isBilanAnnuel && (
            <>
              <p>
                La carte &quot;dernière analyse&quot; reflète les niveaux de
                polluant mesurés dans l&apos;eau au cours des dernières analyses
                disponibles, effectuées sur chaque paramètre. Elle permet de
                connaître l&apos;état de l&apos;eau actuel et renseigne sur deux
                aspects:
              </p>
              <ul className="list-disc ml-6">
                <li>
                  la conformité de l&apos;eau par rapport aux limites de qualité
                  fixées par la réglementation
                </li>
                <li>
                  et le risque sanitaire. Nous avons identifié en rouge les
                  situations pour lesquelles l&apos;eau devrait être
                  déconseillée ou interdite à la consommation pour une partie ou
                  pour l&apos;ensemble de la population, d&apos;après les
                  recommandations émanant du ministère de la Santé ou du Haut
                  Conseil pour la Santé Publique
                </li>
              </ul>
              <p>
                Pour connaître le détail des concentrations en polluants
                retrouvées, veuillez consulter les cartes spécifiques pour
                chaque polluant.
              </p>
            </>
          )}

          <p>
            La qualité de l&apos;eau est évaluée par rapport à 2 types de
            limites:
          </p>
          <ul className="list-disc ml-6">
            <li>
              <b>Des limites de qualité fixées par la réglementation</b> : si
              ces limites sont dépassées, l&apos;eau est déclarée &quot;non
              conforme&quot;. Un dépassement de ces limites indique une
              dégradation de la qualité de l&apos;eau mais ne signifie pas
              forcément qu&apos;il y ait un risque sanitaire.
              <br />* Dans certains cas, l&apos;eau non conforme peut continuer
              à être consommée par l&apos;ensemble de la population. Cette
              situation est indiquée en orange foncée.
              <br />* Lorsqu&apos;un dépassement de la limite de qualité
              entraîne une restriction de la consommation de l&apos;eau, en
              raison d&apos;un possible risque pour la santé, la situation est
              indiquée en rouge
            </li>
            <li>
              <b>Des limites sanitaires établies par les autorités de santé</b>.
              Un dépassement d&apos;une limite sanitaire peut entraîner un
              possible risque pour la santé, d&apos;autant plus si le
              dépassement est prolongé. Dans ces cas, l&apos;eau devrait être
              interdite à la consommation. Cette situation est également
              indiquée en rouge.
            </li>
          </ul>

          {isBilanAnnuel && (
            <>
              <p>
                Les cartes &quot;bilan des non conformités&quot; indiquent le
                pourcentage des analyses effectuées au cours de l&apos;année qui
                sont &quot;non conformes&quot; à la réglementation, en vigueur
                chaque année, pour au moins un des polluants.
              </p>
              <p>L&apos;objectif de ces bilans annuels est double :</p>
              <ul className="list-disc ml-6">
                <li>
                  permettre de voir l&apos;évolution de la qualité de l&apos;eau
                  au fil des années. Les risques liés à une exposition aux
                  substances chimiques à faibles doses via l&apos;eau potable
                  sont d&apos;autant plus élevés que la durée de
                  l&apos;exposition est longue. Il est donc important
                  d&apos;avoir un recul de plusieurs années sur la qualité de
                  l&apos;eau.
                </li>
                <li>
                  observer les conséquences des évolutions dans le suivi des
                  polluants et de la réglementation, en particulier concernant
                  les métabolites de pesticides.
                </li>
              </ul>
            </>
          )}
        </>
      ),
    },
    pesticide: {
      title: "Pesticides",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en pesticides mesurées dans l&apos;eau au cours de la dernière
              analyse de pesticides dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans de non conformité&quot; indiquent le
              pourcentage des analyses de pesticides effectuées au cours de
              chaque année pour lesquelles les concentrations en pesticides sont
              &quot;non conformes&quot; à la réglementation (&gt; à la limite de
              qualité de 0,1 µg/L pour chaque substance ou &gt; 0,5 µg/L pour le
              total pesticides).
            </p>
          )}

          <Tag content="Que sont les pesticides et pourquoi il y en a dans l'eau?" />
          <p>
            Le terme &quot;pesticides&quot; regroupe ici les{" "}
            <b>substances actives</b> chimiques (herbicides, insecticides,
            fongicides etc.) contenues dans les produits phytosanitaires
            (utilisés en agriculture) ou biocides (utilisés à domicile ou dans
            les bâtiments) ainsi que les substances issues de leur dégradation,
            appelés <b>métabolites</b>.
          </p>
          <p>
            L&apos;usage de pesticides conduit à une contamination chronique et
            diffuse de l&apos;environnement. La présence de pesticides dans les
            eaux naturelles (cours d&apos;eau ou eaux souterraines) est due à
            leur entraînement par ruissellement ou à leur infiltration dans les
            sols.
          </p>

          <Tag content="Quelles limites réglementaires pour les pesticides dans l'eau?" />
          <p>
            Il existe <b>2 limites de qualité réglementaires</b> pour les
            pesticides. Si au moins une de ces 2 limites est dépassée,
            l&apos;eau est déclarée &quot;non conforme&quot;.
          </p>
          <ul className="list-disc ml-6">
            <li>
              <b>0,1 µg/L</b> pour chaque substance active et métabolites dits
              &quot;pertinents&quot;
            </li>
            <li>
              <b>0,5 µg/L</b> pour la somme des substance actives et métabolites
              pertinents (paramètre &quot;total pesticide réglementaire&quot;)
            </li>
          </ul>
          <p>
            Selon la définition officielle, un métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            .
          </p>
          <p>
            Pour les métabolites jugés &quot;non pertinents&quot;, la{" "}
            <b>valeur &quot;indicative&quot; de 0,9 µg/L</b> doit être
            respectée. Le dépassement de cette valeur n&apos;est toutefois pas
            considéré comme une &quot;non conformité&quot; par les autorités.
          </p>
          <p>
            De plus, les métabolites non pertinents ne sont pas pris en compte
            dans le calcul du total pesticide réglementaire devant respecter la
            limite de 0,5 µg/L. Pour souligner l&apos;impact de cette approche
            qui sous-estime l&apos;exposition et l&apos;effet cocktail, nous
            avons calculé le &quot;vrai&quot; &quot;total pesticides&quot;,
            incluant les substances actives, les métabolites pertinents et les
            métabolites non pertinents.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites réglementaires?" />
          <p>
            Les limites de qualité appliquées aux pesticides n&apos;ont pas de
            signification sanitaire. Ainsi, un dépassement des limites de
            qualité ou indicatives indique une dégradation de la qualité de
            l&apos;eau mais ne signifie pas qu&apos;il y ait un risque sanitaire
            avéré. Une dérogation prefectorale doit être accordée pour autoriser
            la distribution d&apos;une eau non conforme aux limites de qualité
            et des mesures doivent être prises pour rétablir la qualité de
            l&apos;eau au plus vite.
          </p>
          <p>
            Pour savoir si les concentrations représentent un risque pour la
            santé, les autorités se réfèrent à des valeurs sanitaires qui
            correspondent à la concentration maximale d&apos;une substance ne
            présentant pas de risque pour la santé. Cependant, pour de
            nombreuses substances, il n&apos;y a pas assez de données pour
            établir une valeur sanitaire. De plus, cette approche
            &quot;substance par substance&quot; n&apos;évalue pas, et donc
            ignore, l&apos;effet combiné de plusieurs substances (effet
            cocktail)
          </p>
          <p>
            Selon les recommandations des instances sanitaires, l&apos;eau doit
            être déconseillée à la consommation, <b>par précaution</b>, dans 2
            situations:
          </p>
          <ul className="list-disc ml-6">
            <li>
              en cas de dépassement de valeur sanitaire, si elles existent
            </li>
            <li>
              en cas de dépassement de la limite de qualité, en l&apos;absence
              de valeur sanitaire
            </li>
          </ul>
          <p>
            L&apos;eau potable contaminée contribue à l&apos;exposition de la
            population générale aux pesticides mais l&apos;alimentation solide
            reste la principale source d&apos;exposition. La part de l&apos;eau
            potable dans l&apos;exposition est estimée entre 5 et 10%. Le
            meilleur moyen pour diminuer son exposition aux pesticides est donc
            de manger bio le plus possible.
          </p>
        </>
      ),
    },
    sub_active: {
      title: "Substances actives",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          <p>
            Les cartes &quot;substance actives&quot; indiquent les résultats
            d&apos;analyse obtenus uniquement pour les substances actives
            pesticides. Cette carte n&apos;indique pas les résultats obtenus
            pour les métabolites ni pour le total pesticide.
          </p>
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en substances actives pesticides mesurées dans l&apos;eau au cours
              de la dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses effectuées au cours de chaque année pour
              lesquelles les concentrations en substances actives sont &quot;non
              conformes&quot; à la réglementation (au moins une substance active
              est retrouvée une concentration supérieure à la limite de qualité
              de 0,1 µg/L).
            </p>
          )}

          <Tag content="Que sont les substances actives et pourquoi il y en a dans l'eau?" />
          <p>
            Les substances actives ont des propriétés herbicides, insecticides,
            fongicides etc.
          </p>
          <p>
            L&apos;usage de pesticides conduit à une contamination chronique et
            diffuse des milieux naturels. Certaines substances sont très
            persistantes dans l&apos;environnement et se retrouvent dans
            l&apos;eau potable, même plusieurs années après leur interdiction,
            comme l&apos;atrazine interdite depuis 2003.
          </p>

          <Tag content="Quelles limites réglementaires pour les substances actives pesticides dans l'eau?" />
          <p>
            La limite de qualité réglementaire est fixée à 0,1 µg/L pour chaque
            substance active.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites réglementaires?" />
          <p>
            Les limites de qualité appliquées aux substances actives pesticides
            n&apos;ont pas de signification sanitaire. Ainsi, un dépassement
            d&apos;une limite de qualité indique une dégradation de la qualité
            de l&apos;eau mais ne signifie pas qu&apos;il y ait un risque
            sanitaire avéré. Une dérogation prefectorale doit être accordée pour
            autoriser la distribution d&apos;une eau non conforme aux limites de
            qualité et des mesures doivent être prises pour rétablir la qualité
            de l&apos;eau au plus vite.
          </p>
          <p>
            Pour savoir si les concentrations représentent un risque pour la
            santé, les autorités se réfèrent à des valeurs sanitaires qui
            correspondent à la concentration maximale d&apos;une substance ne
            présentant pas de risque pour la santé. Cependant, pour de
            nombreuses substances, il n&apos;y a pas assez de données pour
            établir une valeur sanitaire. De plus, cette approche
            &quot;substance par substance&quot; n&apos;évalue pas, et donc
            ignore, l&apos;effet combiné de plusieurs substances (effet
            cocktail)
          </p>
          <p>
            Selon les recommandations des instances sanitaires, l&apos;eau doit
            être déconseillée à la consommation, <b>par précaution</b>, dans 2
            situations:
          </p>
          <ul className="list-disc ml-6">
            <li>
              en cas de dépassement de valeur sanitaire, si elles existent
            </li>
            <li>
              en cas de dépassement de la limite de qualité, en l&apos;absence
              de valeur sanitaire
            </li>
          </ul>
        </>
      ),
    },
    metabolite: {
      title: "Métabolites",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          <p>
            Les cartes &quot;métabolites&quot; indiquent les résultats
            d&apos;analyse obtenus uniquement pour les métabolites de
            pesticides. Elles n&apos;indiquent pas les résultats obtenus pour
            les substances actives ni pour le total pesticide.
          </p>
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en métabolites mesurées dans l&apos;eau au cours de la dernière
              analyse de métabolites dont les résultats sont disponibles.
            </p>
          ) : (
            <>
              <p>
                Les cartes &quot;bilans des non conformités&quot; indiquent le
                pourcentage des analyses de métabolites effectuées au cours de
                chaque année pour lesquelles les concentrations en métabolites
                sont &quot;non conformes&quot; à la réglementation en vigueur
                chaque année (au moins un métabolite pertinent a une
                concentration supérieure à la limite de qualité de 0,1 µg/L).
              </p>
              <p>
                Les cartes &quot;bilans des non-conformités&quot; permettent de
                visualiser les évolutions dans le suivi et le statut
                réglementaire des métabolites: Des métabolites ont commencé à
                être suivis en 2021 (métabolites du chloridazone) ou 2023
                (métabolites du chlorothalonil). De plus, certains métabolites
                auparavant considérés comme pertinents et soumis à une limite de
                qualité, ne le sont plus aujourd&apos;hui. Ils ne nécessitent
                plus de respecter une limite de qualité et ne sont donc plus
                pris en compte pour l&apos;identification des situations
                &quot;non conformes&quot;. Par exemple, le changement de
                classement en 2024 du métabolite chlorothalonil R471811 qui
                passe de &quot;pertinent&quot; à &quot;non pertinent&quot;
                explique la grande différence dans le nombre de situations non
                conformes retrouvées entre 2024 et 2025.
              </p>
            </>
          )}

          <Tag content="Que sont les métabolites et pourquoi il y en a dans l'eau?" />
          <p>
            Les métabolites sont des substances chimiques issues de la
            dégradation des substances actives pesticides dans
            l&apos;environnement. Certains, très solubles dans l&apos;eau, ont
            une tendance à s&apos;infiltrer dans les sols et à contaminer les
            eaux souterraines. De plus, des métabolites persistants dans
            l&apos;environnement peuvent se retrouver dans l&apos;eau potable
            plusieurs années après l&apos;interdiction de la substance active
            dont ils sont issus.
          </p>
          <p>
            La distinction que nous avons faite avec les cartes &quot;substance
            actives&quot; et &quot;métabolites&quot; montre que la contamination
            de l&apos;eau potable par les pesticides est en grande majorité due
            à la présence de métabolites.
          </p>

          <Tag content="Quelles limites réglementaires pour les métabolites dans l'eau?" />
          <p>
            Des limites différentes s&apos;appliquent aux métabolites en
            fonction de leur classification en tant que pertinents ou non
            pertinents.. Selon la définition officielle, un métabolite est
            pertinent
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            .
          </p>
          <ul className="list-disc ml-6">
            <li>
              <b>Pour les métabolites &quot;pertinents&quot;</b> ainsi que pour
              les métabolites dont la pertinence n&apos;a pas encore été
              évaluée: la limite de qualité réglementaire est fixée à 0,1 µg/L
              pour chaque métabolite. Si cette limite est dépassée pour au moins
              1 métabolite, l&apos;eau est déclarée &quot;non conforme&quot;
            </li>
            <li>
              <b>Pour les métabolites &quot;non pertinents&quot;</b>, la valeur
              &quot;indicative&quot; de 0.9 µg/L doit être respectée. Le
              dépassement de cette valeur n&apos;est toutefois pas considéré
              comme une &quot;non conformité&quot; par les autorités.
            </li>
          </ul>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites réglementaires?" />
          <p>
            Les limites de qualité pour les métabolites n&apos;ont pas de
            signification sanitaire. Ainsi, un dépassement des limites de
            qualité ou indicatives indique une dégradation de la qualité de
            l&apos;eau mais ne signifie pas qu&apos;il y ait un risque sanitaire
            avéré. En cas de dépassement de la limite de qualité pour un
            métabolite pertinent, une dérogation prefectorale doit être accordée
            pour autoriser la distribution d&apos;une eau non conforme aux
            limites de qualité et des mesures doivent être prises pour rétablir
            la qualité de l&apos;eau au plus vite.
          </p>
          <p>
            Pour savoir si les concentrations représentent un risque pour la
            santé, les autorités se réfèrent à des valeurs sanitaires qui
            correspondent à la concentration maximale d&apos;une substance ne
            présentant pas de risque pour la santé. Cependant, pour de nombreux
            métabolites, il n&apos;y a pas assez de données pour établir une
            valeur sanitaire. De plus, cette approche &quot;substance par
            substance&quot; n&apos;évalue pas, et donc ignore, l&apos;effet
            combiné de plusieurs substances (effet cocktail)
          </p>
          <p>
            Selon les recommandations des instances sanitaires, l&apos;eau doit
            être déconseillée à la consommation, <b>par précaution</b>, dans 2
            situations:
          </p>
          <ul className="list-disc ml-6">
            <li>
              en cas de dépassement de valeur sanitaire, si elles existent
            </li>
            <li>
              en cas de dépassement de la limite de qualité, en l&apos;absence
              de valeur sanitaire
            </li>
          </ul>
        </>
      ),
    },
    metabolite_esa_metolachlore: {
      title: "ESA-métolachlore",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en ESA-métolachlore mesurées dans l&apos;eau au cours de la
              dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilan des non conformités&quot; indiquent le
              pourcentage des analyses d&apos;ESA-métolachlore effectuées au
              cours de chaque année pour lesquelles les concentrations sont non
              conformes à la réglementation en vigueur chaque année.
            </p>
          )}

          <Tag content="Qu'est-ce que l'ESA-métolachlore et pourquoi il y en a dans l'eau?" />
          <p>
            Le métabolite ESA-métolachlore est une substance issue de la
            dégradation du S-métolachlore. Le S-métolachlore est un herbicide
            qui a été très utilisé pendant des années, principalement sur des
            cultures de maïs, soja ou tournesol. Il est interdit en France et en
            Europe depuis 2024.
          </p>
          <p>
            En 2022, plus de 4 millions de français ont été alimentés au moins
            une fois par une eau non conforme à cause de la présence de
            l&apos;ESA-métolachlore. Bien que les risques de contamination des
            nappes phréatiques étaient connus depuis au moins 2004, le suivi de
            l&apos;ESA-métolachlore dans l&apos;eau potable ne s&apos;est
            véritablement généralisé qu&apos;à partir de 2021.
          </p>

          <Tag content="Quelles limites réglementaires pour l'ESA-métolachlore dans l'eau?" />
          <p>
            Les limites applicables aux métabolites sont différentes selon
            qu&apos;ils sont classés comme pertinents ou non pertinents. Un
            métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            .
          </p>
          <p>
            L&apos;agence de sécurité sanitaire (Anses) est chargée de
            l&apos;évaluation de la pertinence des métabolites. En 2019,
            l&apos;Anses a réalisé une première évaluation dans laquelle elle
            conclut à la pertinence de l&apos;ESA-métolachlore, par précaution,
            car des données importantes sur sa toxicité étaient manquantes ou de
            faible qualité.
          </p>
          <p>
            Dans une nouvelle évaluation réalisée en 2022, l&apos;Anses conclut
            cette fois que l&apos;ESA-métolachlore est non pertinent car les
            incertitudes identifiées en 2019 sont levées par de nouvelles études
            fournies par Syngenta.
          </p>
          <p>
            Toutefois, que ce soit en 2019 et 2022, l&apos;Anses n&apos;a jamais
            pu évaluer des aspects importants de la toxicité (cancérogénicité,
            potentiel perturbateur endocrinien) faute de donnée disponible sur
            l&apos;ESA-métolachlore. L&apos;ESA-métolachlore est donc considéré
            non pertinent alors qu&apos;aucune évaluation de son potentiel
            cancérigène n&apos;a été faite.
          </p>
          <p>Ainsi, les limites applicables ont évolué en 2023:</p>
          <ul className="list-disc ml-6">
            <li>
              Jusqu&apos;en 2022, la limite de qualité réglementaire de 0,1 µg/L
              s&apos;appliquait car l&apos;ESA-métolachlore était alors
              considéré comme un métabolite &quot;pertinent&quot;. Si les
              concentrations en ESA-métolachlore dépassaient 0,1 µg/L,
              l&apos;eau était considérée &quot;non conforme&quot;.
            </li>
            <li>
              Depuis 2023, la limite &quot;indicative&quot; de 0,9 µg/L
              s&apos;applique, l&apos;ESA-métolachlore étant dorénavant jugé
              &quot;non pertinent&quot;. Un dépassement de cette limite
              indicative n&apos;est pas considéré comme une &quot;non
              conformité&quot;, ce qui explique pourquoi les bilans depuis 2023
              indiquent partout 0% de non conformité.
            </li>
          </ul>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            Très peu d&apos;études sont disponibles sur l&apos;ESA-métolachlore.
          </p>
          <p>
            Le S-métolachlore, la substance dont est issue
            l&apos;ESA-métolachlore, est classé cancérigène
            &quot;suspecté&quot;. Mais, la toxicité chronique de son métabolite
            ESA-métolachlore, et en particulier ses effets cancérigènes, ne sont
            pas connus. L&apos;Anses n&apos;a pas encore déterminé de valeur
            sanitaire pour l&apos;ESA-métolachlore.
          </p>
          <p>
            Pour savoir si les concentrations d&apos;ESA-métolachlore posent un
            risque pour la santé, les autorités se réfèrent à une valeur
            sanitaire &quot;transitoire&quot; (VST) de 3 µg/L, établie par une
            agence sanitaire allemande. Si les concentrations ne dépassent pas 3
            µg/L, il est jugé qu&apos;il n&apos;y a pas de risque pour la santé.
            Toutefois, cette approche d&apos;évaluation substance par substance,
            n&apos;évalue pas, et donc ignore, l&apos;effet combiné de plusieurs
            substances (effet cocktail).
          </p>
        </>
      ),
    },
    metabolite_chlorothalonil_r471811: {
      title: "Chlorothalonil R471811",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en chlorothalonil R471811 mesurées dans l&apos;eau au cours de la
              dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de chlorothalonil R471811 effectuées au
              cours de chaque année pour lesquelles les concentrations sont non
              conformes à la réglementation en vigueur chaque année.
            </p>
          )}

          <Tag content="Qu'est-ce que le chlorothalonil R471811 et pourquoi il y en a dans l'eau?" />
          <p>
            Le métabolite chlorothalonil R471811 est une substance issue de la
            dégradation du chlorothalonil, un fongicide qui a été très utilisé
            pendant des années, principalement sur des cultures de céréales. Il
            est interdit en France et en Europe depuis 2020.
          </p>
          <p>
            En 2023, plus de 9 millions de français ont été alimentés au moins
            une fois par une eau non conforme à cause de la présence de
            chlorothalonil R471811.
          </p>
          <p>
            Bien que les risques de contamination des nappes phréatiques étaient
            connus depuis au moins 2006, le suivi du chlorothalonil R471811 dans
            l&apos;eau potable ne s&apos;est véritablement généralisé qu&apos;à
            partir de 2023.
          </p>

          <Tag content="Quelles limites réglementaires pour le chlorothalonil R471811 dans l'eau?" />
          <p>
            Les limites applicables aux métabolites sont différentes selon
            qu&apos;ils sont classés comme pertinents ou non pertinents. Un
            métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            . L&apos;agence de sécurité sanitaire (Anses) est chargée de
            l&apos;évaluation de la pertinence des métabolites.
          </p>
          <p>
            En 2022, l&apos;Anses a réalisé une première évaluation dans
            laquelle elle conclut à la pertinence du chlorothalonil R471811, par
            précaution, car des données importantes sur sa toxicité étaient
            manquantes, notamment sur son potentiel cancérigène.
          </p>
          <p>
            Dans une nouvelle évaluation réalisée en 2024, l&apos;Anses conclut
            cette fois que le chlorothalonil R471811 est non pertinent car les
            incertitudes identifiées en 2022 sont levées par de nouvelles
            données fournies par Syngenta. Générations Futures conteste cette
            approche car les données de Syngenta sont très insuffisantes. Le
            chlorothalonil R471811 est ainsi considéré non pertinent alors
            qu&apos;aucune évaluation complète de son potentiel cancérigène
            n&apos;a été faite.
          </p>
          <p>
            Ainsi, les limites applicables au chlorothalonil R471811 ont évolué
            en 2025:
          </p>
          <ul className="list-disc ml-6">
            <li>
              Jusqu&apos;en 2024, la limite de qualité réglementaire de 0,1 µg/L
              s&apos;appliquait car le chlorothalonil R471811 était alors
              considéré comme un métabolite &quot;pertinent&quot;. Si les
              concentrations en chlorothalonil R471811 dépassaient 0,1 µg/L,
              l&apos;eau était considérée &quot;non conforme&quot;.
            </li>
            <li>
              Depuis début 2025, la limite &quot;indicative&quot; de 0,9 µg/L
              s&apos;applique, le chlorothalonil R471811 étant dorénavant jugé
              &quot;non pertinent&quot;. Un dépassement de cette limite
              indicative n&apos;est pas considéré comme une &quot;non
              conformité&quot;, ce qui explique pourquoi le bilan 2025 indique
              partout 0% de non conformité.
            </li>
          </ul>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            Très peu d&apos;études sont disponibles sur le chlorothalonil
            R471811.
          </p>
          <p>
            Le chlorothalonil, la substance dont est issue le chlorothalonil
            R471811 est classé cancérigène &quot;probable&quot;. Mais, la
            toxicité chronique de son métabolite R471811, et en particulier ses
            effets cancérigènes, ne sont pas connus. L&apos;Anses n&apos;a pas
            encore déterminé de valeur sanitaire pour le chlorothalonil R471811.
          </p>
          <p>
            Pour savoir si les concentrations de chlorothalonil R471811 posent
            un risque pour la santé, les autorités se réfèrent à une valeur
            sanitaire &quot;transitoire&quot; (VST) de 3 µg/L, établie par une
            agence sanitaire allemande. Si les concentrations ne dépassent pas 3
            µg/L, il est jugé qu&apos;il n&apos;y a pas de risque pour la santé.
            Toutefois, cette approche d&apos;évaluation substance par substance,
            n&apos;évalue pas, et donc ignore, l&apos;effet combiné de plusieurs
            substances (effet cocktail).
          </p>
        </>
      ),
    },
    metabolite_chloridazone_desphenyl: {
      title: "Chloridazone desphenyl",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en chloridazone desphényl mesurées dans l&apos;eau au cours de la
              dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de chloridazone desphényl effectuées au
              cours de chaque année pour lesquelles les concentrations sont non
              conformes à la réglementation (supérieures à la limite de qualité
              de 0,1 µg/L).
            </p>
          )}

          <Tag content="Qu'est-ce que le chloridazone desphényl et pourquoi il y en a dans l'eau?" />
          <p>
            Le métabolite chloridazone desphényl est une substance issue de la
            dégradation du chloridazone, un herbicide qui a été utilisé
            principalement dans la culture des betteraves des années 1960
            jusqu&apos;en 2020. Le chloridazone est interdit en France et en
            Europe depuis fin 2020.
          </p>
          <p>
            En 2023, plus de 5,5 millions de français ont été alimentés au moins
            une fois par une eau non conforme à cause de la présence de
            chloridazone desphényl.
          </p>
          <p>
            Bien que les risques de contamination des nappes phréatiques étaient
            connus depuis au moins 2007, le suivi du chloridazone desphényl dans
            l&apos;eau potable ne s&apos;est véritablement généralisé qu&apos;à
            partir de 2021.
          </p>

          <Tag content="Quelle limite réglementaire pour le chloridazone desphényl dans l'eau?" />
          <p>
            Le chloridazone desphényl est un métabolite considéré
            &quot;pertinent&quot;. Par conséquent, la limite de qualité
            réglementaire qui s&apos;applique est de 0,1 µg/L. Si cette limite
            est dépassée, l&apos;eau est déclarée &quot;non conforme&quot;.
          </p>
          <p>
            Un métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            . L&apos;agence de sécurité sanitaire (Anses) est chargée de
            l&apos;évaluation de la pertinence des métabolites.
          </p>
          <p>
            L&apos;Anses a réalisé une première évaluation en 2020, dans
            laquelle elle conclut à la pertinence du chloridazone desphényl, par
            précaution, des doutes subsistant sur son potentiel génotoxique
            (capacité à altérer l&apos;ADN et causer des mutations). Dans une
            nouvelle évaluation réalisée en 2023, l&apos;Anses conclut une
            nouvelle fois à la pertinence du chloridazone desphényl, pour les
            mêmes raisons qu&apos;en 2020 et ce, malgré de nouvelles études
            fournies par la société BASF. De plus l&apos;Anses relève la
            présence d&apos;atteintes rénales et vésicales dans les études de
            toxicité répétée chez des rongeurs, associée à l&apos;absence
            d&apos;étude de cancérogénèse.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement de la limite réglementaire?" />
          <p>
            En 2024, l&apos;Anses a défini une valeur sanitaire maximale (Vmax)
            pour le chloridazone desphényl à 11 µg/L. Il est estimé que tant que
            cette valeur n&apos;est pas dépassée, il n&apos;y a pas de risque
            pour la santé. Toutefois, cette approche d&apos;évaluation substance
            par substance, ne permet pas d&apos;évaluer l&apos;effet combiné de
            plusieurs substances (effet cocktail).
          </p>
        </>
      ),
    },
    metabolite_chloridazone_methyl_desphenyl: {
      title: "Chloridazone méthyl-desphényl",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en chloridazone méthyl-desphényl mesurées dans l&apos;eau au cours
              de la dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de chloridazone méthyl-desphényl
              effectuées au cours de chaque année pour lesquelles les
              concentrations sont non conformes à la réglementation (supérieures
              à la limite de qualité de 0,1 µg/L).
            </p>
          )}

          <Tag content="Qu'est-ce que le chloridazone méthyl-desphényl et pourquoi il y en a dans l'eau?" />
          <p>
            Le métabolite chloridazone méthyl-desphényl est une substance issue
            de la dégradation du chloridazone, un herbicide qui a été utilisé
            principalement dans la culture des betteraves des années 1960
            jusqu&apos;en 2020. Le chloridazone est interdit en France et en
            Europe depuis fin 2020.
          </p>
          <p>
            En 2023, plus de 2 millions de français ont été alimentés au moins
            une fois par une eau non conforme à cause de la présence de
            chloridazone méthyl-desphényl.
          </p>
          <p>
            Bien que les risques de contamination des nappes phréatiques étaient
            connus depuis au moins 2007, le suivi du chloridazone
            méthyl-desphényl dans l&apos;eau potable ne s&apos;est véritablement
            généralisé qu&apos;à partir de 2021.
          </p>

          <Tag content="Quelles limites pour le chloridazone desphényl dans l'eau?" />
          <p>
            Le chloridazone méthyl-desphényl est un métabolite considéré
            &quot;pertinent&quot;. Par conséquent, la limite de qualité
            réglementaire qui s&apos;applique est de 0,1 µg/L. Si cette limite
            est dépassée, l&apos;eau est déclarée &quot;non conforme&quot;.
          </p>
          <p>
            Un métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            . L&apos;agence de sécurité sanitaire (Anses) est chargée de
            l&apos;évaluation de la pertinence des métabolites.
          </p>
          <p>
            L&apos;Anses a réalisé une première évaluation en 2020, dans
            laquelle elle conclut à la pertinence du chloridazone
            méthyl-desphényl, par précaution, des doutes subsistant sur son
            potentiel génotoxique (capacité à altérer l&apos;ADN et causer des
            mutations). Dans une nouvelle évaluation réalisée en 2023,
            l&apos;Anses conclut une nouvelle fois à la pertinence du
            chloridazone méthyl-desphényl, pour les mêmes raisons qu&apos;en
            2020 et ce, malgré de nouvelles études fournies par la société BASF.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            En 2024, l&apos;Anses a défini une valeur sanitaire maximale (Vmax)
            pour le chloridazone méthyl-desphényl à 110 µg/L. Il est estimé que
            tant que cette valeur n&apos;est pas dépassée, il n&apos;y a pas de
            risque pour la santé. Toutefois, cette approche d&apos;évaluation
            substance par substance, ne permet pas d&apos;évaluer l&apos;effet
            combiné de plusieurs substances (effet cocktail).
          </p>
        </>
      ),
    },
    metabolite_atrazine_desethyl: {
      title: "Atrazine déséthyl",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en atrazine déséthyl mesurées dans l&apos;eau au cours de la
              dernière analyse dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses d&apos;atrazine déséthyl effectuées au
              cours de chaque année pour lesquelles les concentrations en
              atrazine déséthyl sont non conformes à la réglementation
              (supérieures à la limite de qualité de 0,1 µg/L).
            </p>
          )}

          <Tag content="Qu'est-ce que l'atrazine déséthyl et pourquoi il y en a dans l'eau?" />
          <p>
            Le métabolite atrazine déséthyl est une substance issue de la
            dégradation de l&apos;atrazine, un herbicide qui a été très utilisé,
            notamment sur des cultures de maïs et blé, des années 1960
            jusqu&apos;en 2003. L&apos;atrazine est interdit en France et en
            Europe depuis 2003.
          </p>
          <p>
            En 2023, 20 ans après l&apos;interdiction de l&apos;atrazine, 152
            000 français ont été alimentés au moins une fois par une eau non
            conforme à cause de la présence d&apos;atrazine déséthyl.
          </p>

          <Tag content="Quelles limites pour l'atrazine déséthyl dans l'eau?" />
          <p>
            L&apos;atrazine déséthyl est un métabolite considéré &quot;pertinent
            par défaut&quot;. Par conséquent, la limite de qualité réglementaire
            qui s&apos;applique est de 0,1 µg/L. Si cette limite est dépassée,
            l&apos;eau est déclarée &quot;non conforme&quot;.
          </p>
          <p>
            Un métabolite est pertinent{" "}
            <i>
              &quot;s&apos;il y a lieu de considérer qu&apos;il pourrait
              engendrer un risque sanitaire inacceptable pour le
              consommateur&quot;
            </i>
            . L&apos;agence de sécurité sanitaire (Anses) est chargée de
            l&apos;évaluation de la pertinence des métabolites. L&apos;atrazine
            déséthyl est considéré &quot;pertinent par défaut&quot; car aucune
            évaluation de sa pertinence n&apos;a été réalisée par l&apos;Anses.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            En 2016, l&apos;Anses a défini une valeur sanitaire maximale (Vmax)
            pour l&apos;atrazine déséthyl à 60 µg/L. Il est estimé que tant que
            cette valeur n&apos;est pas dépassée, il n&apos;y a pas de risque
            pour la santé. Toutefois, cette approche d&apos;évaluation substance
            par substance, ne permet pas d&apos;évaluer l&apos;effet combiné de
            plusieurs substances (effet cocktail).
          </p>
        </>
      ),
    },
    nitrate: {
      title: "Nitrates",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique la concentration en
              nitrates mesurée dans l&apos;eau au cours des dernières analyses
              dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de nitrates effectuées au cours de chaque
              année pour lesquelles la concentration en nitrates est &quot;non
              conforme&quot;, c&apos;est à dire supérieure à la limite de
              qualité de 50 mg/L
            </p>
          )}

          <Tag content="Que sont les nitrates et pourquoi il y en a dans l'eau?" />
          <p>
            Les nitrates sont une des formes de l&apos;azote qui est un élément
            essentiel à la croissance des plantes. La présence de nitrates dans
            les eaux résulte à la fois de leur présence naturelle dans
            l&apos;environnement et de la contamination de la ressource par des
            activités humaines (rejets urbains ou industriels) et en particulier
            par des activités agricoles. On estime que l&apos;agriculture est à
            l&apos;origine de 88 % des nitrates contenus dans les eaux suite aux
            épandages de lisier ou d&apos;engrais azotés de synthèse.
          </p>

          <Tag content="Quelle limite réglementaire pour les nitrates dans l'eau?" />
          <p>
            La limite de qualité réglementaire est fixée à 50 mg/L pour les
            nitrates.
          </p>
          <p>
            Des dépassements chroniques de cette limite de 50 mg/L sont
            constatés dans plusieurs régions. Le 21 février 2025, la Commission
            européenne a attaqué la France en justice pour non-respect de cette
            limite dans 107 unités de distribution (UDI) et pour ne pas avoir
            suffisamment informé les consommateurs de ces dépassements.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement de la limite réglementaire?" />
          <p>
            Si la limite de qualité de 50 mg/L est dépassée, l&apos;eau doit
            être interdite à la consommation pour les femmes enceintes et les
            nourrissons. Au-delà de 100 mg/L, toute la population est concernée
            par l&apos;interdiction de consommation.
          </p>
          <p>
            En cas de consommation de l&apos;eau malgré la présence prolongée de
            nitrates à des concentrations supérieures à 50 mg/L, des risques
            pour la santé sont possibles. Les femmes enceintes et les
            nourrissons sont les plus sensibles.
          </p>
          <p>
            Dans l&apos;organisme humain, les nitrates se transforment en
            nitrites. Ces derniers peuvent provoquer la formation de «
            méthémoglobine », une forme d&apos;hémoglobine incapable de
            transporter correctement l&apos;oxygène. Chez les nourrissons, cette
            maladie appelée méthémoglobinémie provoque des cyanoses (coloration
            bleutée de la peau dûe à un manque d&apos;oxygène dans le sang)
            parfois sévères.
          </p>
        </>
      ),
    },
    pfas: {
      title: "PFAS",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en PFAS mesurées dans l&apos;eau au cours de la dernière analyse
              dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de PFAS effectuées au cours de chaque
              année pour lesquelles les concentrations en PFAS sont &quot;non
              conformes&quot; à la réglementation (supérieures à la limite de
              qualité de 0,1 µg/L pour la somme des 20 PFAS).
            </p>
          )}
          <p>
            A compter du 12 janvier 2026, la surveillance des PFAS dans
            l&apos;eau potable devient obligatoire. Avant cette date, les
            données sont peu nombreuses et souvent ciblées sur des zones à fort
            risque de présence.
          </p>

          <Tag content="Que sont les PFAS et pourquoi il y en a dans l'eau?" />
          <p>
            Les PFAS sont une famille de plusieurs milliers de substances
            fabriquées par l&apos;homme qui ont comme caractéristique commune
            d&apos;être très persistantes dans l&apos;environnement.
          </p>
          <p>
            Elles sont utilisées depuis les années 1950 dans de nombreux
            secteurs d&apos;activités en raison de leurs propriétés
            (antiadhésives, antitaches, résistance aux fortes chaleurs…)
          </p>
          <p>
            En raison de leur utilisation importante et de leur persistance, on
            retrouve des PFAS dans tous les compartiments de
            l&apos;environnement. Certaines zones sont plus contaminées en
            raison de rejets industriels, de l&apos;utilisation de mousse
            anti-incendie contenant des PFAS ou en raison d&apos;épandage de
            boues contaminées par des PFAS.
          </p>

          <Tag content="Quelles limites pour les PFAS dans l'eau?" />
          <p>
            La France applique la <b>limite de qualité réglementaire</b> fixée
            par l&apos;Europe de 0,1 µg/L pour la somme de 20 PFAS. Si le
            dépassement de cette limite est confirmé par au moins 3 analyses,
            l&apos;eau devrait être déclarée &quot;non conforme&quot; et les
            autorités sanitaires devraient restreindre la consommation de
            l&apos;eau mais nous constatons que cette mesure de précaution
            n&apos;est pas systématique. Par ailleurs, cette limite est remise
            en question par la communauté scientifique car elle ne serait pas
            assez protectrice. Plusieurs pays (Etats-Unis, Danemark, Suède,
            Pays-Bas…) appliquent déjà des limites plus restrictives.
          </p>
          <p>
            Le Haut Conseil pour la Santé Publique (HCSP) <b>recommande</b>{" "}
            d&apos;appliquer, en plus de la limite de qualité réglementaire, la
            limite de 0,02 µg/L pour la somme des 4 PFAS les plus préoccupants
            (PFOA, PFOS, PFNA et PFHxS). C&apos;est pourquoi nous avons choisi
            d&apos;indiquer les résultats pour la somme de ces 4 PFAS.
          </p>
          <p>
            Par ailleurs, l&apos;agence de sécurité sanitaire Anses a établi
            pour certaines substances PFAS des valeurs sanitaires. Ces valeurs
            sanitaires sont en cours de révision pour prendre en compte les
            données toxicologiques les plus récentes.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            Un dépassement <b>prolongé</b> des valeurs sanitaires mais également
            de la limite de qualité réglementaires et de la limite recommandée
            par le HCSP est préoccupant. Si les dépassements sont confirmés par
            au moins 3 analyses, l&apos;eau ne devrait pas être consommée, en
            particulier par les personnes les plus sensibles (femmes enceintes
            et enfants et personnes immunodéprimées)
          </p>
          <p>
            Une exposition aux PFAS a été associée à des troubles du système
            immunitaire, une augmentation du cholestérol, un faible poids à la
            naissance ou à une augmentation du risque de certains cancers (rein,
            sein). Les enfants sont les plus sensibles.
          </p>
          <p>
            Les principales sources d&apos;exposition pour l&apos;homme sont
            l&apos;alimentation (produits de la mer, viande, œuf) incluant
            l&apos;eau potable si celle-ci est contaminée au-delà des limites.
            Il est donc nécessaire de réduire au maximum les concentrations en
            PFAS dans l&apos;eau potable.
          </p>
        </>
      ),
    },
    cvm: {
      title: "CVM",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en CVM mesurées dans l&apos;eau au cours des dernières analyses
              dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans de non conformité&quot; indiquent le
              pourcentage des analyses de CVM effectuées au cours de chaque
              année pour lesquelles les concentrations en CVM sont &quot;non
              conformes&quot; à la réglementation (supérieures à la limite de
              qualité de 0,5 µg/L).
            </p>
          )}

          <Tag content="Qu'est ce que le CVM et pourquoi il y en a dans l'eau?" />
          <p>
            Le CVM, ou Chlorure de Vinyl Monomère, est une substance chimique
            gazeuse utilisée notamment dans la fabrication des canalisations en
            PVC (polychlorure de vinyle). Les conduites en PVC datant
            d&apos;avant 1980 sont susceptibles de contenir des résidus de CVM
            et d&apos;en relarguer dans l&apos;eau. Les facteurs favorisant le
            relargage du CVM sont la teneur résiduelle en CVM dans le PVC, une
            température élevée de l&apos;eau et un temps de séjour dans la
            canalisation important.
          </p>

          <Tag content="Quelle limite réglementaire pour le CVM dans l'eau?" />
          <p>
            La limite de qualité réglementaire est fixée à 0,5 µg/L pour le CVM.
            Si cette limite est dépassée, une nouvelle analyse de contrôle doit
            être faite dans les 4 semaines. Si le dépassement est confirmé dans
            cette analyse de contrôle, l&apos;eau est déclarée non conforme.
          </p>
          <p>
            La contamination de l&apos;eau par le CVM n&apos;est pas homogène au
            sein d&apos;un même réseau de distribution et concerne le plus
            souvent uniquement quelques tronçons du réseau (ceux alimentés par
            des canalisations en PVC datant d&apos;avant 1980), voire une seule
            rue dans certains cas.{" "}
            <b>
              Si une situation de non conformité est identifiée pour le réseau
              qui alimente votre logement, ce dernier n&apos;est peut-être pas
              pour autant concerné. Pour le savoir, veuillez contacter votre
              mairie.
            </b>
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement de la limite réglementaire?" />
          <p>
            Par précaution, l&apos;eau doit être interdite à la consommation en
            cas de dépassement de la limite de qualité de 0,5 µg/L
          </p>
          <p>
            Le CVM est classé cancérogène certain pour l&apos;homme par le
            Centre international de recherche sur le cancer (CIRC) depuis 1987.
            En effet, lors d&apos;une exposition par les voies respiratoires en
            milieu professionnel, le CVM augmente les risques de développer deux
            formes de cancers du foie : l&apos;angiosarcome hépatique, un cancer
            du foie très rare et l&apos;hépatocarcinome, forme la plus fréquente
            de cancer du foie.
          </p>
          <p>
            De nombreuses études toxicologiques réalisées sur animaux indiquent
            que le CVM est aussi cancérogène pour le foie chez les mammifères
            exposés au CVM <b>par ingestion</b>. Ainsi, l&apos;agence de
            sécurité sanitaire (Anses) indique que{" "}
            <i>
              &quot;les études par inhalation et par ingestion disponibles chez
              l&apos;animal et les preuves de la bonne absorption du chlorure de
              vinyle par ingestion chez l&apos;animal confortent la conclusion
              que le chlorure de vinyle est également cancérigène par ingestion
              pour l&apos;Homme&quot;
            </i>
            . En dépit de ces informations, les pouvoirs publics n&apos;ont mis
            en place aucune étude épidémiologique permettant de suivre
            l&apos;apparition de cancers du foie chez les Français exposés au
            CVM via l&apos;eau potable.
          </p>
        </>
      ),
    },
    sub_indus_perchlorate: {
      title: "Perchlorates",
      content: (
        <>
          <Tag content="Quelles informations données par les cartes?" />
          {!isBilanAnnuel ? (
            <p>
              La carte &quot;dernière analyse&quot; indique les concentrations
              en perchlorates mesurées dans l&apos;eau au cours des dernières
              analyses dont les résultats sont disponibles.
            </p>
          ) : (
            <p>
              Les cartes &quot;bilans des non conformités&quot; indiquent le
              pourcentage des analyses de perchlorates effectuées au cours de
              chaque année pour lesquelles les concentrations en perchlorates
              dépassent le seuil de 4 µg/L au-delà duquel l&apos;eau doit être
              déconseillée à la consommation pour les nourrissons de moins de 6
              mois.
            </p>
          )}

          <Tag content="Que sont les perchlorates et pourquoi il y en a dans l'eau?" />
          <p>
            L&apos;ion perchlorate (ClO4) est principalement présent dans
            l&apos;environnement sous forme de sels (perchlorate
            d&apos;ammonium, de potassium, de magnésium, ou de sodium). Ces
            divers sels peuvent être utilisés dans de nombreuses applications
            militaires (dispositifs pyrotechniques, poudres d&apos;armes à
            feu…), industrielles (propulseurs de fusées) et agricoles (engrais)
            et ainsi être émis dans l&apos;environnement.
          </p>
          <p>
            Les ions perchlorates étant très stables et très solubles dans
            l&apos;eau, ils restent présents dans l&apos;eau, une fois émis,
            pendant des dizaines d&apos;années.
          </p>
          <p>
            La présence de perchlorates dans les communes du Nord Pas de Calais,
            de Picardie et de Champagne Ardennes est liée aux zones ayant connu
            des combats pendant la première guerre mondiale, bien que cela ne
            soit pas la seule explication à cette contamination.
          </p>

          <Tag content="Quelles limites réglementaires pour les perchlorates dans l'eau?" />
          <p>
            Il n&apos;existe pas de limite réglementaire pour les perchlorates
            dans l&apos;eau potable. Il n&apos;y a pas non plus obligation de
            les rechercher.
          </p>
          <p>
            Sur la base de plusieurs avis de l&apos;agence de sécurité sanitaire
            (Anses), le ministère de la santé recommande, <b>par précaution</b>,
            de :
          </p>
          <ul className="list-disc ml-6">
            <li>
              limiter l&apos;utilisation d&apos;eau dont la teneur en ions
              perchlorate dépasse 4 µg/L pour la préparation des biberons des
              nourrissons de moins de 6 mois ;
            </li>
            <li>
              limiter la consommation d&apos;eau dont la teneur en ions
              perchlorate dépasse 15 µg/L pour les femmes enceintes et
              allaitantes (protégeant ainsi fœtus et nourrissons)
            </li>
          </ul>
          <p>
            Même en cas de dépassement de ces limites, l&apos;eau est considérée
            comme &quot;conforme&quot; à la réglementation sur l&apos;eau
            potable car aucune limite réglementaire ne s&apos;applique aux
            perchlorates.
          </p>

          <Tag content="Quels risques pour la santé en cas de dépassement des limites?" />
          <p>
            Les perchlorates interfèrent avec le processus d&apos;incorporation
            de l&apos;iode par la thyroïde. Ils peuvent donc induire une
            diminution dans la synthèse des hormones thyroïdiennes (TSH) qui
            sont impliquées dans de nombreuses fonctions (croissance du fœtus,
            tonus musculaire, métabolisme des lipides, régulation de
            l&apos;humeur…). En cas de dépassement des limites préconisées par
            l&apos;Anses, il est préférable pour les nourrissons et les femmes
            enceintes de ne pas consommer l&apos;eau, afin de prévenir tout
            risque pour le développement de l&apos;enfant.
          </p>
        </>
      ),
    },
  };

  return explanations[category];
};

export default function PollutionSidePanel({
  category,
  period,
  onClose,
}: {
  category: string;
  period: string;
  onClose?: () => void;
}) {
  const categoryDetails = getCategoryById(category);
  const explanation = getCategoryExplanation(category, period);

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
          <div className="bg-white p-4 py-8 flex flex-col gap-4 rounded-t-lg flex-1 overflow-y-auto">
            {explanation && (
              <div className="text-black space-y-4">{explanation.content}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
