// menu-data.js - THE SINGLE SOURCE OF TRUTH

const MENU_DATA = [
    {
        category: "Suppen",
        items: [
            { id: "1", name: "Tomatensuppe", price: 5.00, desc: "Köstliche Tomatensuppe" },
            { id: "2", name: "Daal Linsensuppe", price: 5.00, desc: "Indische Linsensuppe" },
            { id: "3", name: "Hähnchen Suppe", price: 6.00, desc: "Hühnersuppe nach indischer Art" },
            { id: "4", name: "Mulligatawny Suppe", price: 6.50, desc: "Kräftige, exotische Currysuppe" }
        ]
    },
    {
        category: "Vorspeisen",
        items: [
            { id: "5", name: "Veg. Samosa", price: 5.00, desc: "2 gefüllte Teigtaschen mit Kartoffeln und Erbsen" },
            { id: "6", name: "Chicken Samosa", price: 5.50, desc: "2 gefüllte Teigtaschen mit Hühnerfleisch" },
            { id: "7", name: "Aloo Tiki", price: 5.00, desc: "Gebratene Kartoffelmedaillons" },
            { id: "8", name: "Mix Pakora", price: 5.50, desc: "Frisches Gemüse in Kichererbsenteig frittiert" },
            { id: "9", name: "Paneer Pakora", price: 6.00, desc: "Hausgemachter Käse in Kichererbsenteig" },
            { id: "10", name: "Aloo Pakora", price: 5.50, desc: "Kartoffeln in Kichererbsenteig" },
            { id: "11", name: "Gobi Pakora", price: 5.50, desc: "Blumenkohl in Kichererbsenteig" },
            { id: "12", name: "Mashroom Pakora", price: 5.50, desc: "Champignons in Kichererbsenteig" },
            { id: "13", name: "Chicken Pakora", price: 6.00, desc: "Hähnchenbrustfilet in Kichererbsenteig" },
            { id: "14", name: "Prawn Pakora", price: 7.50, desc: "Garnelen in Kichererbsenteig" }
        ]
    },
    {
        category: "Vegetarische Spezialitäten",
        items: [
            { id: "15", name: "Vegi Mix", price: 13.00, desc: "Frisches gemischtes Gemüse in Currysoße" },
            { id: "16", name: "Palak Aallu", price: 13.00, desc: "Kartoffeln mit Spinat" },
            { id: "17", name: "Saag Aallu", price: 13.00, desc: "Kartoffeln in würzigem Spinat" },
            { id: "18", name: "Tarka Daal", price: 12.50, desc: "Gelbe Linsen mit Zwiebeln & Knoblauch geröstet" },
            { id: "19", name: "Bhindi Masala", price: 13.00, desc: "Frische Okraschoten mit Zwiebeln und Gewürzen" },
            { id: "20", name: "Baingen Aallu", price: 13.00, desc: "Auberginen und Kartoffeln in Currysoße" },
            { id: "21", name: "Mushroom Aallu", price: 13.00, desc: "Frische Champignons und Kartoffeln in Currysoße" },
            { id: "22", name: "Gobi Aallu", price: 13.00, desc: "Blumenkohl und Kartoffeln in Gewürzen" },
            { id: "23", name: "Channa Masala", price: 12.50, desc: "Kichererbsen in pikanter Currysoße" },
            { id: "24", name: "Veg. Korma", price: 13.50, desc: "Gemüse in milder Kokos-Sahnesoße" },
            { id: "25", name: "Nauratan Korma", price: 14.00, desc: "Gemüse, Käse & Früchte in milder Soße" },
            { id: "26", name: "Shahi Paneer", price: 14.00, desc: "Hausgemachter Käse in cremiger Tomatensoße" },
            { id: "27", name: "Paneer Tikka Masala", price: 14.50, desc: "Käse aus dem Lehmofen in würziger Soße" },
            { id: "28", name: "Paneer Jalfrezi", price: 14.00, desc: "Käse mit Paprika und Zwiebeln (pikant)" },
            { id: "29", name: "Paneer Bhunna Masala", price: 14.00, desc: "Käse in kräftiger Masalasoße" },
            { id: "30", name: "Palak Paneer", price: 14.00, desc: "Käse mit Spinat" },
            { id: "31", name: "Paneer Muttar Aallu", price: 14.50, desc: "Käse mit Erbsen und Kartoffeln" }
        ]
    },
    {
        category: "Hähnchen Spezialitäten",
        items: [
            { id: "32", name: "Chicken Curry", price: 14.50, desc: "Hähnchen in Currysoße" },
            { id: "33", name: "Chicken Tikka Masala", price: 15.50, desc: "Gegrilltes Hähnchen in würziger Soße" },
            { id: "34", name: "Chicken Korma", price: 15.00, desc: "Hähnchen in milder Kokos-Sahnesoße" },
            { id: "35", name: "Butter Chicken", price: 15.50, desc: "Hähnchen in Butter-Tomatensoße" },
            { id: "36", name: "Kashmiri Chicken", price: 15.50, desc: "Hähnchen mit Früchten in Currysoße" },
            { id: "37", name: "Chicken Goan Curry", price: 15.50, desc: "Hähnchen in pikanter Kokossoße" },
            { id: "38", name: "Chicken Jalfrezi", price: 15.50, desc: "Hähnchen mit Paprika & Zwiebeln (pikant)" },
            { id: "39", name: "Chicken Kadai", price: 15.50, desc: "Hähnchen in spezieller Masalasoße" },
            { id: "40", name: "Chicken Bhuna", price: 15.50, desc: "Hähnchen in kräftiger Soße" },
            { id: "41", name: "Vegi Chicken", price: 15.00, desc: "Hähnchen mit frischem Gemüse" },
            { id: "42", name: "Chicken Palak", price: 15.50, desc: "Hähnchen mit Spinat" },
            { id: "43", name: "Chicken Dhansik", price: 15.50, desc: "Hähnchen mit Linsen (süß-sauer-scharf)" },
            { id: "44", name: "Chicken Madras", price: 15.50, desc: "Hähnchen in Kokos-Currysoße (scharf)" },
            { id: "45", name: "Chicken Vindalo", price: 15.50, desc: "Hähnchen mit Kartoffeln (sehr scharf)" }
        ]
    },
    {
        category: "Lamm Spezialitäten",
        items: [
            { id: "46", name: "Lamb Curry", price: 17.00, desc: "Lammfleisch in klassischer Currysoße" },
            { id: "47", name: "Lamb Tikka Masala", price: 17.50, desc: "Gegrilltes Lamm in würziger Masalasoße" },
            { id: "48", name: "Lamb Korma", price: 17.00, desc: "Lammfleisch in Kokos-Sahnesoße" },
            { id: "49", name: "Butter Lamb", price: 17.50, desc: "Lamm in cremiger Tomatensoße" },
            { id: "50", name: "Kashmiri Lamb", price: 17.50, desc: "Lamm mit Früchten in milder Currysoße" },
            { id: "51", name: "Lamb Goan Curry", price: 17.50, desc: "Lamm in pikanter Kokos-Currysoße" },
            { id: "52", name: "Lamb Jalfrezi", price: 17.50, desc: "Lamm mit Paprika, Tomaten & Zwiebeln" },
            { id: "53", name: "Lamb Kadai", price: 17.50, desc: "Lamm aus dem Wok mit Gewürzen" },
            { id: "54", name: "Lamb Bhuna", price: 17.50, desc: "Lamm in kräftig gewürzter Soße" },
            { id: "55", name: "Vegi Lamb", price: 17.00, desc: "Lammfleisch mit gemischtem Gemüse" },
            { id: "56", name: "Lamb Palak", price: 17.50, desc: "Lammfleisch mit Rahmspinat" },
            { id: "57", name: "Lamb Dhansik", price: 17.50, desc: "Lamm mit Linsen (süß-sauer-scharf)" },
            { id: "58", name: "Lamb Madras", price: 17.50, desc: "Lamm in Kokos-Currysoße (scharf)" },
            { id: "59", name: "Lamb Vindalo", price: 17.50, desc: "Lamm mit Kartoffeln (sehr scharf)" }
        ]
    },
    {
        category: "Fisch & Garnelen",
        items: [
            { id: "60", name: "Prawn Curry", price: 18.50, desc: "Riesengarnelen in klassischer Currysoße" },
            { id: "61", name: "Prawn Korma", price: 18.50, desc: "Riesengarnelen in milder Kokos-Sahnesoße" },
            { id: "62", name: "Prawn Tikka Masala", price: 18.50, desc: "Riesengarnelen in Masalasoße" },
            { id: "63", name: "Fish Curry", price: 18.50, desc: "Seelachsfilet in pikanter Currysoße" },
            { id: "64", name: "Fish Tikka Masala", price: 18.50, desc: "Gebratenes Seelachsfilet in Masalasoße" }
        ]
    },
    {
        category: "Tandoori Spezialitäten",
        items: [
            { id: "65", name: "Chicken Tikka", price: 17.50, desc: "Mariniertes Hähnchenbrustfilet gegrillt" },
            { id: "66", name: "Tandoori Chicken", price: 17.50, desc: "Hähnchenkeulen am Knochen gegrillt" },
            { id: "67", name: "Malai Tikka", price: 17.50, desc: "Hähnchenbrustfilet in Cashew-Käse-Marinade" },
            { id: "68", name: "Haryali Tikka", price: 17.50, desc: "Hähnchenbrustfilet in Spinat-Minze-Marinade" },
            { id: "69", name: "Lamb Tikka", price: 18.50, desc: "Zarte Lammfleischstücke mariniert & gegrillt" },
            { id: "70", name: "Lamb Chops", price: 20.50, desc: "Marinierte Lammkoteletts gegrillt" },
            { id: "71", name: "Seekh Kabab", price: 19.50, desc: "Würziges Lammhackfleisch gegrillt" },
            { id: "72", name: "Prawn Tikka", price: 20.50, desc: "Riesengarnelen in pikanter Marinade gegrillt" },
            { id: "73", name: "Paneer Tikka", price: 17.50, desc: "Hausgemachter Käse mariniert & gegrillt" },
            { id: "74", name: "Fish Tawa Fry", price: 20.50, desc: "Seelachsfilet mit exotischen Gewürzen gegrillt" },
            { id: "75", name: "Zafrani Mix Grill", price: 24.00, desc: "Zusammenstellung verschiedener Tandoori Spezialitäten" }
        ]
    },
    {
        category: "Biryani (Reisgerichte)",
        items: [
            { id: "76", name: "Vegi Biryani", price: 14.50, desc: "Gebratener Basmatireis mit frischem Gemüse" },
            { id: "77", name: "Chicken Bombay Biryani", price: 16.50, desc: "Basmatireis mit Hähnchenfleisch" },
            { id: "78", name: "Lamb Karachi Biryani", price: 17.50, desc: "Basmatireis mit Lammfleisch" },
            { id: "79", name: "Prawn Zafran Biryani", price: 20.50, desc: "Basmatireis mit Riesengarnelen" }
        ]
    },
    {
        category: "Beilagen & Brot",
        items: [
            { id: "80", name: "Frisches Tandoori Brot", price: 3.50, desc: "Fladenbrot aus dem Lehmofen" },
            { id: "81", name: "Chapati Roti", price: 3.50, desc: "Vollkornfladenbrot" },
            { id: "82", name: "Naan", price: 3.00, desc: "Hefeteigfladenbrot" },
            { id: "83", name: "Allo Naan", price: 4.50, desc: "Brot gefüllt mit Kartoffeln" },
            { id: "84", name: "Cheese Naan", price: 5.00, desc: "Brot gefüllt mit Käse" },
            { id: "85", name: "Butter Naan", price: 3.50, desc: "Brot mit Butter überzogen" },
            { id: "86", name: "Garlic Naan", price: 4.50, desc: "Brot mit Knoblauch" },
            { id: "87", name: "Tandoori Parantha", price: 4.50, desc: "Mehrschichtiges Vollkornbrot" },
            { id: "88", name: "Mint Sauce", price: 3.00, desc: "Erfrischende Minzsoße" },
            { id: "89", name: "Natur Joghurt", price: 2.50, desc: "Einfacher Joghurt" },
            { id: "90", name: "Raita", price: 4.00, desc: "Joghurt mit Gurken & Gewürzen" },
            { id: "91", name: "Mango Chutney", price: 3.00, desc: "Süß-saures Chutney" },
            { id: "92", name: "Imli (Tamarind) Chutney", price: 3.00, desc: "Süß-saures Tamarinden Chutney" },
            { id: "93", name: "Laal Chutney", price: 3.50, desc: "Scharfe Chili-Soße" },
            { id: "94", name: "Green Chutney", price: 3.50, desc: "Würzige Kräutersoße" },
            { id: "95", name: "Pickles", price: 3.50, desc: "Eingelegtes Gemüse (Pikant)" },
            { id: "96", name: "Soße nach Wahl", price: 5.00, desc: "Zusätzliche Curry- oder Masalasoße" }
        ]
    },
    {
        category: "Extras & Salate",
        items: [
            { id: "97", name: "Gemüse-Frühlingsrollen", price: 5.00, desc: "Frittierte Rollen mit Gemüsefüllung" },
            { id: "98", name: "Pommes frites", price: 3.50, desc: "Knusprige Pommes" },
            { id: "99", name: "Chicken Nuggets (6 Stk.)", price: 4.50, desc: "Hähnchen-Nuggets" },
            { id: "100", name: "Basmati - Reis", price: 3.50, desc: "Extra Portion Reis" },
            { id: "101", name: "Zeera - Reis", price: 4.00, desc: "Basmatireis mit geröstetem Kreuzkümmel" },
            { id: "102", name: "Zafrani - Reis", price: 5.50, desc: "Basmatireis mit Safran und Erbsen" },
            { id: "103", name: "Gemischter Salat", price: 6.00, desc: "Frischer gemischter Salat" },
            { id: "104", name: "Chicken Salat", price: 7.50, desc: "Gemischter Salat mit Hähnchenstreifen" },
            { id: "105", name: "Zafrani Chicken Salat", price: 8.50, desc: "Salat mit Tandoori Chicken" }
        ]
    },
    {
        category: "Desserts",
        items: [
            { id: "106", name: "Mango Kulfi", price: 5.50, desc: "Indisches Mango-Eis" },
            { id: "107", name: "Almond Kulfi", price: 5.50, desc: "Indisches Mandel-Eis" },
            { id: "108", name: "Pista Kulfi", price: 5.50, desc: "Indisches Pistazien-Eis" },
            { id: "109", name: "Gulab Jamun", price: 5.50, desc: "Teigbällchen in Zuckersirup" },
            { id: "110", name: "Ras Malai", price: 5.50, desc: "Käsebällchen in süßer Milch" }
        ]
    },
    {
        category: "Getränke (Alkoholfrei)",
        items: [
            { id: "111", name: "Lassi", price: 4.00, desc: "Süß oder Salzig" },
            { id: "112", name: "Mango Lassi", price: 4.50, desc: "Joghurtgetränk mit Mango" },
            { id: "113", name: "Rosé Lassi", price: 4.50, desc: "Joghurtgetränk mit Rosenwasser" },
            { id: "114", name: "Coca Cola", price: 3.50, desc: "0,33l" },
            { id: "115", name: "Cola Zero", price: 3.50, desc: "0,33l" },
            { id: "116", name: "Sprite", price: 3.50, desc: "0,33l" },
            { id: "117", name: "Fanta", price: 3.50, desc: "0,33l" },
            { id: "118", name: "Pinacolada", price: 5.50, desc: "Alkoholfreier Cocktail" },
            { id: "119", name: "Mint-Margarita", price: 5.50, desc: "Erfrischender Cocktail mit Minze" },
            { id: "120", name: "Ipanema", price: 5.50, desc: "Alkoholfreier Cocktail mit Limette" }
        ]
    }
];

const MENU_ITEMS = MENU_DATA.flatMap(category => category.items);
