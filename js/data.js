/**
 * ECWA Umuahia District Church Council - Data Registry
 * Contains the 66 Local Churches grouped under 9 LCC Councils (3 rows x 3 columns)
 */

const LCC_CHURCH_GROUPS = [
    {
        id: "bende",
        name: "Bende LCC",
        councilName: "Bende Local Church council",
        churches: [
            "ECWA 1 Mgbele ozuitem",
            "ECWA 2 Isiegbu ozuitem",
            "ECWA 3 Okpoko ozuitem",
            "ECWA Bende",
            "ECWA Ozuakoli",
            "ECWA Igbere",
            "ECWA Nkpa"
        ]
    },
    {
        id: "ibeku",
        name: "Ibeku LCC",
        councilName: "Ibeku Local Church council",
        churches: [
            "ECWA 1 Township",
            "ECWA 2 Township",
            "ECWA Afara",
            "ECWA Ekeneobize",
            "ECWA Ehume",
            "ECWA Isiadu",
            "ECWA Amaeke ibeku",
            "ECWA Unity church"
        ]
    },
    {
        id: "item",
        name: "Item LCC",
        councilName: "Item Local Church council",
        churches: [
            "ECWA Amaeke item",
            "ECWA Amaokwe item",
            "ECWA Okoko item",
            "ECWA Akanu item",
            "ECWA Apanu item"
        ]
    },
    {
        id: "etiti",
        name: "Etiti LCC",
        councilName: "Etiti Local Church council",
        churches: [
            "ECWA Amaigiuta",
            "ECWA Umuejere",
            "ECWA Amakohia etiti",
            "ECWA Umuariam",
            "ECWA Ekenaziz",
            "ECWA Umujiriji (Ehume)",
            "ECWA Isieke"
        ]
    },
    {
        id: "mbano",
        name: "Mbano LCC",
        councilName: "Mbano Local Church council",
        churches: [
            "ECWA Umuduru",
            "ECWA Umuneke",
            "ECWA Umunuma",
            "ECWA Umuzealama",
            "ECWA Akowa",
            "ECWA Nkwere",
            "ECWA Umueze",
            "ECWA Nzerem"
        ]
    },
    {
        id: "ohafia",
        name: "Ohafia LCC",
        councilName: "Ohafia Local Church council",
        churches: [
            "ECWA Asaga ohafia",
            "ECWA Okonu ohafia",
            "ECWA Isiama ohafia",
            "ECWA Amangwu",
            "ECWA Arochukwu",
            "ECWA Nkporo",
            "ECWA Akanu ohafia",
            "ECWA Eziafor ohafia"
        ]
    },
    {
        id: "ohuhu",
        name: "Ohuhu LCC",
        councilName: "Ohuhu Local Church council",
        churches: [
            "ECWA Akpahia",
            "ECWA Umuegwu",
            "ECWA Okaiuga",
            "ECWA Ubaha",
            "ECWA Umuagu",
            "EWCA Orieamaenyi"
        ]
    },
    {
        id: "olokoro",
        name: "Olokoro LCC",
        councilName: "Olokoro Local Church council",
        churches: [
            "ECWA 1 Itaja olokoro",
            "ECWA 2 Olokoro",
            "ECWA Ubakala",
            "ECWA Old umuahia",
            "ECWA World bank Umuahia",
            "ECWA Amawom",
            "ECWA Amaba",
            "ECWA Okwe",
            "ECWA Nnanno"
        ]
    },
    {
        id: "owerri",
        name: "Owerri LCC",
        councilName: "Owerri Local Church council",
        churches: [
            "ECWA Prefab Aladinma owerri",
            "ECWA Oriji owerri",
            "ECWA Amakohia owerri",
            "ECWA World bank owerri",
            "ECWA Obinze owerri",
            "ECWA Orodo",
            "ECWA Irete",
            "ECWA Otulu"
        ]
    }
];

const LCC_COUNCILS = LCC_CHURCH_GROUPS.map(g => ({
    id: g.id,
    name: g.name.replace(/ LCC$/i, ''),
    fullName: g.name,
    desc: g.councilName
}));

// Flattened list of all 66 Local Churches with rich metadata
let globalChurchIndex = 1;
const CONGREGATIONS = [];

LCC_CHURCH_GROUPS.forEach(lcc => {
    lcc.churches.forEach((churchName, idx) => {
        const id = globalChurchIndex++;
        const formattedNum = String(id).padStart(2, '0');
        CONGREGATIONS.push({
            id: id,
            numberStr: formattedNum,
            rawName: churchName,
            displayName: `${formattedNum}. ${churchName}`,
            lccId: lcc.id,
            lccName: lcc.name,
            lccCouncil: lcc.councilName,
            localIndex: idx + 1,
            searchSlug: `${churchName} ${lcc.name}`.toLowerCase().replace(/[^a-z0-9]/g, '')
        });
    });
});

const CHURCH_NAMES = CONGREGATIONS.map(c => c.rawName);
