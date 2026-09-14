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
    { id: "bende", name: "Bende", desc: "Local Church Council - Bende Zone" },
    { id: "etiti", name: "Etiti", desc: "Local Church Council - Etiti Zone" },
    { id: "ibeku", name: "Ibeku", desc: "Local Church Council - Ibeku Zone" },
    { id: "item", name: "Item", desc: "Local Church Council - Item Zone" },
    { id: "mbano", name: "Mbano", desc: "Local Church Council - Mbano Zone" },
    { id: "ohafia", name: "Ohafia", desc: "Local Church Council - Ohafia Zone" },
    { id: "ohuhu", name: "Ohuhu", desc: "Local Church Council - Ohuhu Zone" },
    { id: "olokoro", name: "Olokoro", desc: "Local Church Council - Olokoro Zone" },
    { id: "owerri", name: "Owerri", desc: "Local Church Council - Owerri Zone" }
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
