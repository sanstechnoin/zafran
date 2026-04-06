// menu-data.js - THE SINGLE SOURCE OF TRUTH

const MENU_DATA = [
    {
        category: "Suppen",
        items: [
            { id: "1", name: "Tomatensuppe", price: 5.00, desc: "Nach indischer Art", allergy: "" },
            { id: "2", name: "Daal Linsensuppe", price: 5.00, desc: "Nach indischer Art", allergy: "" },
            { id: "3", name: "Hähnchen Suppe", price: 6.00, desc: "Nach indischer Art", allergy: "" },
            { id: "4", name: "Mulligatawny Suppe", price: 6.50, desc: "Linsensuppe mit Hähnchen nach indischer Art", allergy: "" }
        ]
    },
    {
        category: "Vorspeisen",
        items: [
            { id: "5", name: "Veg. Samosa", price: 5.00, desc: "Zwei Teigtaschen gefüllt mit Kartoffeln und Erbsen", allergy: "A" },
            { id: "6", name: "Chicken Samosa", price: 5.50, desc: "Zwei Teigtaschen gefüllt mit Hähnchen", allergy: "A" },
            { id: "7", name: "Aloo Tiki", price: 5.00, desc: "Zwei frittierte Kartoffeln und Gemüsemix in Kichererbsenteig", allergy: "K" },
            { id: "8", name: "Mix Pakora", price: 5.50, desc: "Zwiebeln, Kartoffeln, Aubergine und Blumenkohl in Kichererbsenteig", allergy: "K" },
            { id: "9", name: "Paneer Pakora", price: 6.00, desc: "Frittierter indischer Frischkäse in Kichererbsenteig", allergy: "G" },
            { id: "10", name: "Aloo Pakora", price: 5.50, desc: "Frittierte Kartoffeln in Reismehl und Kichererbsenteig mit speziellen Gewürzen", allergy: "G" },
            { id: "11", name: "Gobi Pakora", price: 5.50, desc: "Frittierter Blumenkohl in Reismehl und Kichererbsenteig mit speziellen Gewürzen", allergy: "G" },
            { id: "12", name: "Mashroom Pakora", price: 5.50, desc: "Frittierte Champignons in Reismehl und Kichererbsenteig mit speziellen Gewürzen", allergy: "5,6,G" },
            { id: "13", name: "Chicken Pakora", price: 6.00, desc: "Frittiertes Hähnchenfleisch in Reismehl und Kichererbsenteig mit speziellen Gewürzen", allergy: "5,6,G" },
            { id: "14", name: "Prawn Pakora", price: 7.50, desc: "Frittierte Garnelen in Kichererbsenteig", allergy: "F" }
        ]
    },
    {
        category: "Veganes",
        items: [
            { id: "15", name: "Vegi Mix", price: 13.00, desc: "Mischgemüse in indischer Currysoße", allergy: "" },
            { id: "16", name: "Palak Aallu", price: 13.00, desc: "Spinat und Kartoffeln mit indischen Kräutern", allergy: "" },
            { id: "17", name: "Saag Aallu", price: 13.00, desc: "Raps und Kartoffeln mit indischen Kräutern", allergy: "" },
            { id: "18", name: "Tarka Daal", price: 12.50, desc: "Linsencurry mit indischen Kräutern", allergy: "" },
            { id: "19", name: "Bhindi Masala", price: 13.00, desc: "Okra in Zwiebel - Tomaten - Curry", allergy: "" },
            { id: "20", name: "Baingen Aallu", price: 13.00, desc: "Aubergine und Kartoffeln in Zwiebel-Tomaten-Curry", allergy: "" },
            { id: "21", name: "Mushroom Aallu", price: 13.00, desc: "Champignons und Kartoffeln in Zwiebel-Tomaten-Curry", allergy: "" },
            { id: "22", name: "Gobi Aallu", price: 13.00, desc: "Blumenkohl und Kartoffeln in Zwiebel-Tomaten-Curry", allergy: "" },
            { id: "23", name: "Channa Masala", price: 12.50, desc: "Kichererbsen in Zwiebel-Tomaten-Curry", allergy: "" }
        ]
    },
    {
        category: "Vegetarisches",
        items: [
            { id: "24", name: "Veg. Korma", price: 13.50, desc: "Mischgemüse, Tomaten-Sahne-Currysoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "25", name: "Nauratan Korma", price: 14.00, desc: "Mischgemüse und Cocktailfrüchte in Tomaten-Sahnesoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "26", name: "Shahi Paneer", price: 14.00, desc: "Indischer Frischkäse in Tomaten-Sahne-Curry mit Cashews", allergy: "G,E" },
            { id: "27", name: "Paneer Tikka Masala", price: 14.50, desc: "Indischer Frischkäse in Zwiebel-, Tomaten-Curry", allergy: "G" },
            { id: "28", name: "Paneer Jalfrezi", price: 14.00, desc: "Indischer Frischkäse in Tomaten-Curry mit Zwiebeln und Paprika", allergy: "G" },
            { id: "29", name: "Paneer Bhunna Masala", price: 14.00, desc: "Indischer Frischkäse in Tomaten-Curry mit Paprika", allergy: "G" },
            { id: "30", name: "Palak Paneer", price: 14.00, desc: "Indischer Frischkäse und Spinat mit indischen Kräutern", allergy: "G" },
            { id: "31", name: "Paneer Muttar Aallu", price: 14.50, desc: "Indischer Frischkäse mit grünen Erbsen und Kartoffeln in Zwiebel-, Tomaten-Curry", allergy: "G" }
        ]
    },
    {
        category: "Chicken",
        items: [
            { id: "32", name: "Chicken Curry", price: 14.50, desc: "Hähnchenfleisch in Zwiebel-Tomaten-Curry", allergy: "" },
            { id: "33", name: "Chicken Tikka Masala", price: 15.50, desc: "Gegrilltes Hähnchenfilet in Tomaten-Curry", allergy: "" },
            { id: "34", name: "Chicken Korma", price: 15.00, desc: "Hähnchenfleisch, Tomaten-Sahne-Currysoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "35", name: "Butter Chicken", price: 15.50, desc: "Gegrilltes Hähnchenfilet in Tomaten-Sahne-Buttersoße mit Cashews & Ingwer", allergy: "G,E" },
            { id: "36", name: "Kashmiri Chicken", price: 15.50, desc: "Hähnchenfleisch mit Früchten in Tomaten-Sahnesoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "37", name: "Chicken Goan Curry", price: 15.50, desc: "Hähnchenfleisch mit Mango in Tomaten-Sahne-Curry mit Kokosraspeln", allergy: "G" },
            { id: "38", name: "Chicken Jalfrezi", price: 15.50, desc: "Hähnchenfleisch in Tomaten-Curry mit Zwiebeln und Paprika", allergy: "" },
            { id: "39", name: "Chicken Kadai", price: 15.50, desc: "Hähnchenfleisch in Tomaten-Joghurt-Curry mit grünem Chili und Ingwer", allergy: "G" },
            { id: "40", name: "Chicken Bhuna", price: 15.50, desc: "Hähnchenfleisch in Zwiebel-Tomaten-Curry mit Paprika", allergy: "" },
            { id: "41", name: "Vegi Chicken", price: 15.00, desc: "Hähnchenfleisch in Zwiebel-Tomaten-Curry mit Mischgemüse", allergy: "" },
            { id: "42", name: "Chicken Palak", price: 15.50, desc: "Hähnchenfleisch mit Spinat und indischen Kräutern", allergy: "" },
            { id: "43", name: "Chicken Dhansik", price: 15.50, desc: "Hähnchenfleisch mit Linsen", allergy: "" },
            { id: "44", name: "Chicken Madras", price: 15.50, desc: "Hähnchenfleisch in pikantem Zwiebel-Tomaten-Curry mit Zitrone und Kokosraspeln", allergy: "" },
            { id: "45", name: "Chicken Vindalo", price: 15.50, desc: "Hähnchenfleisch in sehr pikantem Zwiebel-Tomaten-Curry mit Kartoffel", allergy: "" }
        ]
    },
    {
        category: "Lamm",
        items: [
            { id: "46", name: "Lamb Curry", price: 17.00, desc: "Lammfleisch in Zwiebel-Tomaten-Curry", allergy: "" },
            { id: "47", name: "Lamb Tikka Masala", price: 17.50, desc: "Gegrilltes Lammfilet in Tomaten-Curry", allergy: "" },
            { id: "48", name: "Lamb Korma", price: 17.00, desc: "Lammfleisch in Tomaten-Sahne-Currysoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "49", name: "Butter Lamb", price: 17.50, desc: "Gegrilltes Lammfilet in Tomaten-Sahne-Buttersoße mit Cashews und Ingwer", allergy: "G,E" },
            { id: "50", name: "Kashmiri Lamb", price: 17.50, desc: "Lammfleisch mit Früchten in Tomaten-Sahnesoße mit Mandeln, Cashew, Rosinen und Kokosraspeln", allergy: "G,E" },
            { id: "51", name: "Lamb Goan Curry", price: 17.50, desc: "Lammfleisch mit Mango in Tomaten-Sahne-Curry mit Kokosraspeln", allergy: "G,E" },
            { id: "52", name: "Lamb Jalfrezi", price: 17.50, desc: "Lammfleisch in Tomaten-Curry mit Zwiebeln und Paprika", allergy: "" },
            { id: "53", name: "Lamb Kadai", price: 17.50, desc: "Lammfleisch in Tomaten-Joghurt-Curry mit grünem Chili und Ingwer", allergy: "G" },
            { id: "54", name: "Lamb Bhuna", price: 17.50, desc: "Lammfleisch in Zwiebel-Tomaten - Curry mit Paprika", allergy: "" },
            { id: "55", name: "Vegi Lamb", price: 17.00, desc: "Lammfleisch in Zwiebeln-Tomaten-Curry mit Mischgemüse", allergy: "" },
            { id: "56", name: "Lamb Palak", price: 17.50, desc: "Lammfleisch mit Spinat und indischen Kräutern", allergy: "" },
            { id: "57", name: "Lamb Dhansik", price: 17.50, desc: "Lammfleisch mit Linsen", allergy: "" },
            { id: "58", name: "Lamb Madras", price: 17.50, desc: "Lammfleisch in pikantern Zwiebel-Tomaten-Curry mit Zitrone und Kokosraspeln", allergy: "" },
            { id: "59", name: "Lamb Vindalo", price: 17.50, desc: "Lammfleisch in sehr pikantem Zwiebel-Tomaten - Curry mit Kartoffel", allergy: "" }
        ]
    },
    {
        category: "Fisch & Garnelen",
        items: [
            { id: "60", name: "Prawn Curry", price: 18.50, desc: "Tigergarnelen gekocht in Zwiebel-Tomaten-Curry mit indischen Gewürzen", allergy: "B" },
            { id: "61", name: "Prawn Korma", price: 18.50, desc: "Tigergarnelen in Tomaten-Sahne-Currysoße mit Mandeln, Cashews, Rosinen und Kokosraspeln", allergy: "B,E,G" },
            { id: "62", name: "Prawn Tikka Masala", price: 18.50, desc: "Marinierte Tigergarnelen aus dem Tandoor Ofen in Tomaten-Curry", allergy: "B" },
            { id: "63", name: "Fish Curry", price: 18.50, desc: "Lachsfilet gekocht in Zwiebel-Tomaten-Curry mit indischen Gewürzen", allergy: "D" },
            { id: "64", name: "Fish Tikka Masala", price: 18.50, desc: "Mariniertes Lachsfilet aus dem Tandoor Ofen in Tomaten-Curry", allergy: "D" }
        ]
    },
    {
        category: "Tandoori",
        items: [
            { id: "65", name: "Chicken Tikka", price: 17.50, desc: "Mariniertes Hähnchenfilet in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "" },
            { id: "66", name: "Tandoori Chicken", price: 17.50, desc: "Hähnchenschenkel mariniert in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "" },
            { id: "67", name: "Malai Tikka", price: 17.50, desc: "Hähnchenfilet mariniert in Sahne-Joghurt-Cashews mit milden Gewürzen", allergy: "E,G" },
            { id: "68", name: "Haryali Tikka", price: 17.50, desc: "Hähnchenfilet mariniert in grünem Chili-Sahne-Joghurt, Cashews und Koriander", allergy: "" },
            { id: "69", name: "Lamb Tikka", price: 18.50, desc: "Lammfleisch mariniert in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "" },
            { id: "70", name: "Lamb Chops", price: 20.50, desc: "Lammkotelett mariniert in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "" },
            { id: "71", name: "Seekh Kabab", price: 19.50, desc: "Lammhackspieß mit Zwiebeln und indischen Gewürzen", allergy: "" },
            { id: "72", name: "Prawn Tikka", price: 20.50, desc: "Tigergamelen mariniert in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "B" },
            { id: "73", name: "Paneer Tikka", price: 17.50, desc: "Indischer Frischkäse mariniert in Joghurt und Tandoori Masala aus dem Tandoor Ofen", allergy: "G" },
            { id: "74", name: "Fish Tawa Fry", price: 20.50, desc: "Lachsfilet in indischen Gewürzen mariniert und knusprig auf der Tawa gebraten", allergy: "D" },
            { id: "75", name: "Zafrani Mix Grill", price: 24.00, desc: "Spezieller Grillteller mit Hähnchenfilet, Lammfleisch Tikka, Lammkotelett und Seekh Kabab aus dem Tandoor Ofen", allergy: "" }
        ]
    },
    {
        category: "Biryani",
        items: [
            { id: "76", name: "Vegi Biryani", price: 14.50, desc: "Basmatireis mit Mischgemüse und feinen Gewürzen in der Pfanne zubereitet", allergy: "" },
            { id: "77", name: "Chicken Bombay Biryani", price: 16.50, desc: "Basmatireis mit Hähnchenfleisch und feinen Gewürzen in der Pfanne zubereitet", allergy: "" },
            { id: "78", name: "Lamb Karachi Biryani", price: 17.50, desc: "Basmatireis mit Lammfleisch und feinen Gewürzen in der Pfanne zubereitet", allergy: "" },
            { id: "79", name: "Prawn Zafran Biryani", price: 20.50, desc: "Basmatireis mit Tigergarnelen und feinen Gewürzen in der Pfanne zubereitet", allergy: "B" }
        ]
    },
    {
        category: "Brot",
        items: [
            { id: "80", name: "Frisches Tandoori Brot", price: 3.50, desc: "Indisches Brot aus Vollkornmehl, traditionell in Tandoor gebacken", allergy: "A" },
            { id: "81", name: "Chapati Roti", price: 3.50, desc: "Dünnes indisches Fladenbrot aus Vollkornmehl, in der heißen Pfanne gebacken", allergy: "A" },
            { id: "82", name: "Naan", price: 3.00, desc: "Brotsorte nach indischer Art, traditionell im Tandoor gebacken", allergy: "A,G" },
            { id: "83", name: "Allo Naan", price: 4.50, desc: "Naanbrot gefüllt mit gewürzten Kartoffeln", allergy: "A,G" },
            { id: "84", name: "Cheese Naan", price: 5.00, desc: "Naanbrot gefüllt mit Käse", allergy: "A,G" },
            { id: "85", name: "Butter Naan", price: 3.50, desc: "Naanbrot mit Butter bestrichen", allergy: "A,G" },
            { id: "86", name: "Garlic Naan", price: 4.50, desc: "Naanbrot gefüllt mit Knoblauch und Koriander", allergy: "A,G" },
            { id: "87", name: "Tandoori Parantha", price: 4.50, desc: "Mehrlagiges knuspriges und aromatisches Paranthabrot aus Weizenmehl gebacken", allergy: "A,G" }
        ]
    },
    {
        category: "Beilagen",
        items: [
            { id: "88", name: "Mint Sauce", price: 3.00, desc: "Joghurt und Minze", allergy: "G" },
            { id: "89", name: "Natur Joghurt", price: 2.50, desc: "", allergy: "G" },
            { id: "90", name: "Raita", price: 4.00, desc: "Joghurt mit Zwiebeln, Tomaten und Gurken", allergy: "G" },
            { id: "91", name: "Mango Chutney", price: 3.00, desc: "", allergy: "L" },
            { id: "92", name: "Imli (Tamarind) Chutney", price: 3.00, desc: "", allergy: "L" },
            { id: "93", name: "Laal Chutney (scharfe Sambal-Soße)", price: 3.50, desc: "Mit roten Chilischoten und Knoblauch", allergy: "" },
            { id: "94", name: "Green Chutney", price: 3.50, desc: "Mit Minze, Koriander und grünen Chilischoten", allergy: "" },
            { id: "95", name: "Pickles", price: 3.50, desc: "", allergy: "J,L" },
            { id: "96", name: "Soße nach Wahl", price: 5.00, desc: "Butter-, Curry-, Korma-, Kashmiri-Soße", allergy: "" }
        ]
    },
    {
        category: "Kinder Menüs",
        items: [
            { id: "97", name: "Gemüse-Frühlingsrollen", price: 5.00, desc: "Zwei knusprige Frühlingsrollen, gefüllt mit frischem Gernüse und indischen Gewürzen", allergy: "A" },
            { id: "98", name: "Pommes frites", price: 3.50, desc: "", allergy: "" },
            { id: "99", name: "Chicken Nuggets (6 Stk.)", price: 4.50, desc: "", allergy: "" }
        ]
    },
    {
        category: "Reis",
        items: [
            { id: "100", name: "Basmati - Reis", price: 3.50, desc: "", allergy: "" },
            { id: "101", name: "Zeera - Reis", price: 4.00, desc: "Reis mit Kreuzkümmel", allergy: "" },
            { id: "102", name: "Zafrani - Reis", price: 5.50, desc: "Reis mit Safran", allergy: "" }
        ]
    },
    {
        category: "Salate",
        items: [
            { id: "103", name: "Gemischter Salat", price: 6.00, desc: "Zwiebeln, Tomaten, Gurken und Eisbergsalat mit Joghurtsoße", allergy: "" },
            { id: "104", name: "Chicken Salat", price: 7.50, desc: "Zwiebeln, Tornaten, Gurken und Eisbergsalat mit Chicken Tikka und Joghurtsoße", allergy: "" },
            { id: "105", name: "Zafrani Chicken Salat", price: 8.50, desc: "Rote und weiße Zwiebeln, Tomaten, Gurken und Eisbergsalat mit Chicken Tikka und Joghurtsoße sowie einer Nussmischung", allergy: "" }
        ]
    },
    {
        category: "Dessert",
        items: [
            { id: "106", name: "Mango Kulfi", price: 5.50, desc: "Mango Fruchteis", allergy: "G" },
            { id: "107", name: "Almond Kulfi", price: 5.50, desc: "Milcheis mit Mandeln und Kardamon", allergy: "E,C" },
            { id: "108", name: "Pista Kulfi", price: 5.50, desc: "Milcheis mit Pistazien und Kardamon", allergy: "E,C" },
            { id: "109", name: "Gulab Jamun", price: 5.50, desc: "Zwei Milchbällchen mit Kokosraspeln", allergy: "G,H" },
            { id: "110", name: "Ras Malai", price: 5.50, desc: "Weiche Käsebällchen in süßer und aromatischer Milch", allergy: "E,C" }
        ]
    },
    {
        category: "Getränke",
        items: [
            { id: "111", name: "Lassi", price: 4.00, desc: "0,3l", allergy: "G" },
            { id: "112", name: "Mango Lassi", price: 4.50, desc: "0,3l", allergy: "G" },
            { id: "113", name: "Rosé Lassi", price: 4.50, desc: "0,3l", allergy: "G" },
            { id: "114", name: "Coca Cola", price: 3.50, desc: "0,33l", allergy: "10,14" },
            { id: "115", name: "Cola Zero", price: 3.50, desc: "0,33l", allergy: "9,14" },
            { id: "116", name: "Sprite", price: 3.50, desc: "0,33l", allergy: "" },
            { id: "117", name: "Fanta", price: 3.50, desc: "0,33l", allergy: "" },
            { id: "118", name: "Pinacolada", price: 5.50, desc: "0,5l", allergy: "G" },
            { id: "119", name: "Mint-Margarita", price: 5.50, desc: "0,5l", allergy: "" },
            { id: "120", name: "Ipanema", price: 5.50, desc: "0,5l", allergy: "" }
        ]
    }
];
const MENU_ITEMS = MENU_DATA.flatMap(category => category.items);
