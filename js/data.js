/**
 * ECWA Umuahia District Church Council - Data Registry
 * Contains the 61 Local Churches and 9 LCC Councils
 */

const CHURCH_NAMES = [
    "Afara",
    "Akanu",
    "Akokwa",
    "Akpahia",
    "Aladinma",
    "Amaeke Ibeku",
    "Amaeke Item",
    "Amangwu",
    "Amainyinta",
    "Amaoba",
    "Amaokwe",
    "Amawom Olokoro",
    "Amakohia Etiti",
    "Apuanu",
    "Arochukwu",
    "Asaga",
    "Awa Oguta",
    "ECWA Gospel Igbere",
    "Eziafor",
    "Ikenanzizi",
    "Irete",
    "Isieke",
    "Isiadu",
    "Isiama",
    "Itaja Olokoro 1",
    "Nkpa",
    "Nkporo",
    "Nkwere",
    "Nnonuo",
    "Nzerem",
    "Obinze",
    "Ogboko (Ozuitem 3)",
    "Okaiuga",
    "Okoko",
    "Okonaku",
    "Okwe",
    "Old Umuahia",
    "Orodo",
    "Orieamaenyi",
    "Orji Owerri",
    "Otulu",
    "Ozuitem 1",
    "Ozuitem 2",
    "Township 1",
    "Township 2",
    "Ubaha",
    "Ubakala",
    "Umudike",
    "Umuduru",
    "Umuegwu Okpuala",
    "Umuejere",
    "Umueze 1",
    "Umuezeala-Ama Mbano",
    "Umujiriji (Ehume)",
    "Umuneke",
    "Umunnuma",
    "Umuariam",
    "Unity Church",
    "Uzuakoli",
    "World Bank Owerri",
    "World Bank Umuahia"
];

const LCC_COUNCILS = [
    { id: "bende", name: "Bende", desc: "Bende Local Church council" },
    { id: "etiti", name: "Etiti", desc: "Etiti Local Church council" },
    { id: "ibeku", name: "Ibeku", desc: "Ibeku Local Church council" },
    { id: "item", name: "Item", desc: "Item Local Church council" },
    { id: "mbano", name: "Mbano", desc: "Mbano Local Church council" },
    { id: "ohafia", name: "Ohafia", desc: "Ohafia Local Church council" },
    { id: "ohuhu", name: "Ohuhu", desc: "Ohuhu Local Church council" },
    { id: "olokoro", name: "Olokoro", desc: "Olokoro Local Church council" },
    { id: "owerri", name: "Owerri", desc: "Owerri Local Church council" }
];

// Helper mapping for Local Churches
const CONGREGATIONS = CHURCH_NAMES.map((name, index) => {
    const id = index + 1;
    const formattedNum = String(id).padStart(2, '0');
    return {
        id: id,
        numberStr: formattedNum,
        rawName: name,
        displayName: `${formattedNum}. ${name}`,
        searchSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '')
    };
});
