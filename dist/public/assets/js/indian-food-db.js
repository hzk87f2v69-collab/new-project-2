/* ═══════════════════════════════════════════════════════════
   INDIAN FOOD DATABASE  –  Ace Fitness
   Per-unit nutrition: cal, protein(g), carbs(g), fat(g)
   ═══════════════════════════════════════════════════════════ */
const INDIAN_FOOD_DB = [
  // ── BREAKFAST ──
  { id:"roti", name:"Roti (Chapati)", aliases:["chapati","phulka","roti"], cat:"breakfast", unit:"piece", per:{cal:104,p:3,c:18,f:3}, portions:[{l:"1 roti",q:1},{l:"2 roti",q:2},{l:"3 roti",q:3},{l:"4 roti",q:4}] },
  { id:"paratha", name:"Paratha (Plain)", aliases:["parantha","paratha"], cat:"breakfast", unit:"piece", per:{cal:180,p:4,c:25,f:7}, portions:[{l:"1 paratha",q:1},{l:"2 paratha",q:2},{l:"3 paratha",q:3}] },
  { id:"aloo_paratha", name:"Aloo Paratha", aliases:["potato paratha"], cat:"breakfast", unit:"piece", per:{cal:220,p:5,c:30,f:9}, portions:[{l:"1 paratha",q:1},{l:"2 paratha",q:2}] },
  { id:"poha", name:"Poha", aliases:["flattened rice","chivda"], cat:"breakfast", unit:"bowl", per:{cal:250,p:5,c:42,f:7}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5}] },
  { id:"upma", name:"Upma", aliases:["sooji upma","rava upma"], cat:"breakfast", unit:"bowl", per:{cal:210,p:5,c:32,f:7}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5}] },
  { id:"idli", name:"Idli", aliases:["steamed idli"], cat:"breakfast", unit:"piece", per:{cal:58,p:2,c:12,f:0.4}, portions:[{l:"1 idli",q:1},{l:"2 idli",q:2},{l:"3 idli",q:3},{l:"4 idli",q:4}] },
  { id:"dosa", name:"Dosa (Plain)", aliases:["plain dosa","sada dosa"], cat:"breakfast", unit:"piece", per:{cal:133,p:4,c:18,f:5}, portions:[{l:"1 dosa",q:1},{l:"2 dosa",q:2}] },
  { id:"masala_dosa", name:"Masala Dosa", aliases:["potato dosa"], cat:"breakfast", unit:"piece", per:{cal:250,p:6,c:32,f:11}, portions:[{l:"1 dosa",q:1},{l:"2 dosa",q:2}] },
  { id:"vada", name:"Medu Vada", aliases:["vada","urad vada"], cat:"breakfast", unit:"piece", per:{cal:140,p:5,c:14,f:7}, portions:[{l:"1 vada",q:1},{l:"2 vada",q:2},{l:"3 vada",q:3}] },
  { id:"uttapam", name:"Uttapam", aliases:["uthappam"], cat:"breakfast", unit:"piece", per:{cal:180,p:5,c:28,f:5}, portions:[{l:"1 uttapam",q:1},{l:"2 uttapam",q:2}] },
  { id:"bread_toast", name:"Bread Toast + Butter", aliases:["toast","bread"], cat:"breakfast", unit:"piece", per:{cal:120,p:3,c:15,f:5}, portions:[{l:"1 slice",q:1},{l:"2 slices",q:2},{l:"3 slices",q:3}] },
  { id:"besan_chilla", name:"Besan Chilla", aliases:["gram flour pancake","chilla"], cat:"breakfast", unit:"piece", per:{cal:150,p:7,c:16,f:6}, portions:[{l:"1 chilla",q:1},{l:"2 chilla",q:2},{l:"3 chilla",q:3}] },
  { id:"sattu_drink", name:"Sattu Drink", aliases:["sattu","sattu sharbat"], cat:"breakfast", unit:"glass", per:{cal:180,p:10,c:28,f:3}, portions:[{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"puri", name:"Puri", aliases:["poori"], cat:"breakfast", unit:"piece", per:{cal:120,p:2,c:14,f:6}, portions:[{l:"2 puri",q:2},{l:"3 puri",q:3},{l:"4 puri",q:4}] },

  // ── RICE & GRAINS ──
  { id:"rice", name:"Basmati Rice (Cooked)", aliases:["chawal","bhaat","steamed rice"], cat:"lunch", unit:"bowl", per:{cal:260,p:5,c:57,f:0.5}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5},{l:"2 bowls",q:2}] },
  { id:"brown_rice", name:"Brown Rice", aliases:["unpolished rice"], cat:"lunch", unit:"bowl", per:{cal:220,p:5,c:45,f:1.8}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5}] },
  { id:"khichdi", name:"Khichdi", aliases:["khichri","dal khichdi"], cat:"lunch", unit:"bowl", per:{cal:220,p:8,c:35,f:5}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5}] },
  { id:"biryani", name:"Chicken Biryani", aliases:["biryani","dum biryani"], cat:"lunch", unit:"bowl", per:{cal:400,p:18,c:50,f:14}, portions:[{l:"½ plate",q:0.5},{l:"1 plate",q:1},{l:"1½ plate",q:1.5}] },
  { id:"veg_biryani", name:"Veg Biryani", aliases:["vegetable biryani","pulao"], cat:"lunch", unit:"bowl", per:{cal:300,p:7,c:48,f:9}, portions:[{l:"½ plate",q:0.5},{l:"1 plate",q:1},{l:"1½ plate",q:1.5}] },
  { id:"jeera_rice", name:"Jeera Rice", aliases:["cumin rice"], cat:"lunch", unit:"bowl", per:{cal:240,p:4,c:50,f:4}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1}] },

  // ── DAL & LENTILS ──
  { id:"dal_toor", name:"Dal (Toor/Arhar)", aliases:["dal","toor dal","arhar dal"], cat:"lunch", unit:"katori", per:{cal:180,p:12,c:26,f:2}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"dal_moong", name:"Moong Dal", aliases:["green gram dal"], cat:"lunch", unit:"katori", per:{cal:150,p:10,c:22,f:1.5}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"dal_chana", name:"Chana Dal", aliases:["bengal gram dal"], cat:"lunch", unit:"katori", per:{cal:190,p:11,c:28,f:3}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"dal_masoor", name:"Masoor Dal", aliases:["red lentil dal"], cat:"lunch", unit:"katori", per:{cal:160,p:11,c:24,f:1}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"dal_tadka", name:"Dal Tadka", aliases:["tempered dal"], cat:"lunch", unit:"katori", per:{cal:200,p:11,c:26,f:5}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"rajma", name:"Rajma Curry", aliases:["kidney beans","rajma chawal"], cat:"lunch", unit:"katori", per:{cal:210,p:13,c:30,f:4}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"chole", name:"Chole (Chickpea Curry)", aliases:["chana masala","chickpea curry"], cat:"lunch", unit:"katori", per:{cal:230,p:12,c:32,f:6}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"sambar", name:"Sambar", aliases:["sambhar"], cat:"lunch", unit:"katori", per:{cal:130,p:6,c:20,f:3}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"rasam", name:"Rasam", aliases:["pepper rasam"], cat:"lunch", unit:"katori", per:{cal:60,p:2,c:10,f:1}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },

  // ── VEG CURRIES ──
  { id:"paneer_butter", name:"Paneer Butter Masala", aliases:["paneer","butter paneer"], cat:"lunch", unit:"katori", per:{cal:320,p:14,c:12,f:24}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"palak_paneer", name:"Palak Paneer", aliases:["spinach paneer"], cat:"lunch", unit:"katori", per:{cal:280,p:14,c:10,f:20}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"aloo_gobi", name:"Aloo Gobi", aliases:["potato cauliflower"], cat:"lunch", unit:"katori", per:{cal:180,p:4,c:22,f:8}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"bhindi", name:"Bhindi (Okra) Sabzi", aliases:["ladyfinger","okra"], cat:"lunch", unit:"katori", per:{cal:120,p:3,c:14,f:6}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"baingan", name:"Baingan Bharta", aliases:["eggplant","brinjal"], cat:"lunch", unit:"katori", per:{cal:150,p:3,c:12,f:10}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"mix_veg", name:"Mix Veg Curry", aliases:["mixed vegetable"], cat:"lunch", unit:"katori", per:{cal:140,p:4,c:16,f:6}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"matar_paneer", name:"Matar Paneer", aliases:["peas paneer"], cat:"lunch", unit:"katori", per:{cal:290,p:13,c:14,f:20}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"dal_makhani", name:"Dal Makhani", aliases:["black dal","maa ki dal"], cat:"dinner", unit:"katori", per:{cal:250,p:10,c:24,f:12}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },

  // ── NON-VEG ──
  { id:"egg_boiled", name:"Boiled Egg", aliases:["anda","egg","eggs"], cat:"protein", unit:"piece", per:{cal:78,p:6,c:1,f:5}, portions:[{l:"1 egg",q:1},{l:"2 eggs",q:2},{l:"3 eggs",q:3},{l:"4 eggs",q:4},{l:"5 eggs",q:5},{l:"6 eggs",q:6}] },
  { id:"egg_omelette", name:"Egg Omelette", aliases:["omelette","omelet"], cat:"protein", unit:"piece", per:{cal:120,p:8,c:1,f:9}, portions:[{l:"1 egg",q:1},{l:"2 eggs",q:2},{l:"3 eggs",q:3}] },
  { id:"egg_bhurji", name:"Egg Bhurji", aliases:["scrambled eggs Indian"], cat:"protein", unit:"piece", per:{cal:130,p:8,c:2,f:10}, portions:[{l:"2 eggs",q:2},{l:"3 eggs",q:3},{l:"4 eggs",q:4}] },
  { id:"chicken_breast", name:"Chicken Breast (Grilled)", aliases:["grilled chicken","chicken"], cat:"protein", unit:"gram", per:{cal:1.65,p:0.31,c:0,f:0.036}, portions:[{l:"100g",q:100},{l:"150g",q:150},{l:"200g",q:200},{l:"250g",q:250}] },
  { id:"chicken_curry", name:"Chicken Curry", aliases:["chicken gravy","murgh curry"], cat:"dinner", unit:"katori", per:{cal:280,p:22,c:8,f:18}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"butter_chicken", name:"Butter Chicken", aliases:["murgh makhani"], cat:"dinner", unit:"katori", per:{cal:350,p:20,c:10,f:25}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"tandoori_chicken", name:"Tandoori Chicken", aliases:["tandoori"], cat:"protein", unit:"piece", per:{cal:190,p:24,c:3,f:9}, portions:[{l:"1 leg piece",q:1},{l:"2 pieces",q:2}] },
  { id:"fish_curry", name:"Fish Curry", aliases:["machhi curry","fish"], cat:"dinner", unit:"katori", per:{cal:220,p:20,c:6,f:13}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"keema", name:"Mutton Keema", aliases:["minced mutton","keema"], cat:"dinner", unit:"katori", per:{cal:310,p:22,c:4,f:23}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"egg_curry", name:"Egg Curry", aliases:["anda curry"], cat:"dinner", unit:"piece", per:{cal:140,p:8,c:5,f:9}, portions:[{l:"1 egg",q:1},{l:"2 eggs",q:2},{l:"3 eggs",q:3}] },

  // ── DAIRY & PROTEIN ──
  { id:"paneer_raw", name:"Paneer (Raw)", aliases:["cottage cheese"], cat:"protein", unit:"gram", per:{cal:2.65,p:0.18,c:0.01,f:0.20}, portions:[{l:"50g",q:50},{l:"100g",q:100},{l:"150g",q:150},{l:"200g",q:200}] },
  { id:"curd", name:"Curd / Dahi", aliases:["dahi","yogurt","curd"], cat:"snack", unit:"katori", per:{cal:100,p:4,c:8,f:5}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"raita", name:"Raita", aliases:["boondi raita","cucumber raita"], cat:"snack", unit:"katori", per:{cal:120,p:4,c:10,f:6}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"lassi_sweet", name:"Lassi (Sweet)", aliases:["sweet lassi","punjabi lassi"], cat:"snack", unit:"glass", per:{cal:220,p:6,c:30,f:8}, portions:[{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"lassi_salt", name:"Lassi (Salt/Chaas)", aliases:["chaas","buttermilk","mattha"], cat:"snack", unit:"glass", per:{cal:60,p:3,c:5,f:2}, portions:[{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"milk", name:"Milk (Full Cream)", aliases:["dudh","milk"], cat:"protein", unit:"glass", per:{cal:150,p:8,c:12,f:8}, portions:[{l:"½ glass",q:0.5},{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"milk_toned", name:"Milk (Toned)", aliases:["toned milk","low fat milk"], cat:"protein", unit:"glass", per:{cal:100,p:7,c:10,f:3}, portions:[{l:"½ glass",q:0.5},{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"whey", name:"Whey Protein Shake", aliases:["protein shake","whey","supplement"], cat:"protein", unit:"scoop", per:{cal:120,p:24,c:3,f:1.5}, portions:[{l:"1 scoop",q:1},{l:"2 scoops",q:2}] },

  // ── SNACKS ──
  { id:"samosa", name:"Samosa", aliases:["samosa"], cat:"snack", unit:"piece", per:{cal:260,p:4,c:28,f:14}, portions:[{l:"1 samosa",q:1},{l:"2 samosa",q:2}] },
  { id:"pakora", name:"Pakora / Bhajiya", aliases:["bhajiya","pakoda"], cat:"snack", unit:"piece", per:{cal:60,p:2,c:6,f:3}, portions:[{l:"3 pieces",q:3},{l:"5 pieces",q:5},{l:"8 pieces",q:8}] },
  { id:"mathri", name:"Mathri / Namkeen", aliases:["namkeen","mixture"], cat:"snack", unit:"katori", per:{cal:350,p:6,c:32,f:22}, portions:[{l:"½ katori",q:0.5},{l:"1 katori",q:1}] },
  { id:"banana", name:"Banana", aliases:["kela"], cat:"snack", unit:"piece", per:{cal:105,p:1,c:27,f:0.4}, portions:[{l:"1 banana",q:1},{l:"2 bananas",q:2}] },
  { id:"apple", name:"Apple", aliases:["seb"], cat:"snack", unit:"piece", per:{cal:95,p:0.5,c:25,f:0.3}, portions:[{l:"1 apple",q:1},{l:"2 apples",q:2}] },
  { id:"makhana", name:"Roasted Makhana", aliases:["foxnuts","lotus seeds"], cat:"snack", unit:"katori", per:{cal:180,p:5,c:28,f:5}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"peanuts", name:"Peanuts (Roasted)", aliases:["moongphali","groundnut"], cat:"snack", unit:"gram", per:{cal:5.67,p:0.26,c:0.16,f:0.49}, portions:[{l:"25g",q:25},{l:"50g",q:50},{l:"100g",q:100}] },
  { id:"almonds", name:"Almonds", aliases:["badam"], cat:"snack", unit:"piece", per:{cal:7,p:0.25,c:0.2,f:0.6}, portions:[{l:"5 almonds",q:5},{l:"10 almonds",q:10},{l:"15 almonds",q:15}] },
  { id:"dates", name:"Dates (Khajoor)", aliases:["khajoor","khajur"], cat:"snack", unit:"piece", per:{cal:66,p:0.4,c:18,f:0}, portions:[{l:"2 dates",q:2},{l:"3 dates",q:3},{l:"5 dates",q:5}] },

  // ── BEVERAGES ──
  { id:"chai", name:"Chai (Milk Tea)", aliases:["tea","chai"], cat:"snack", unit:"cup", per:{cal:70,p:2,c:10,f:2}, portions:[{l:"1 cup",q:1},{l:"2 cups",q:2},{l:"3 cups",q:3}] },
  { id:"black_coffee", name:"Black Coffee", aliases:["coffee"], cat:"snack", unit:"cup", per:{cal:5,p:0.3,c:0,f:0}, portions:[{l:"1 cup",q:1},{l:"2 cups",q:2}] },
  { id:"coffee_milk", name:"Coffee with Milk", aliases:["latte","milk coffee"], cat:"snack", unit:"cup", per:{cal:90,p:3,c:10,f:4}, portions:[{l:"1 cup",q:1},{l:"2 cups",q:2}] },
  { id:"coconut_water", name:"Coconut Water", aliases:["nariyal pani"], cat:"snack", unit:"glass", per:{cal:45,p:1,c:9,f:0.5}, portions:[{l:"1 glass",q:1},{l:"2 glasses",q:2}] },
  { id:"nimbu_pani", name:"Nimbu Pani (Lemonade)", aliases:["shikanji","lemon water"], cat:"snack", unit:"glass", per:{cal:50,p:0,c:12,f:0}, portions:[{l:"1 glass",q:1},{l:"2 glasses",q:2}] },

  // ── GYM FOODS ──
  { id:"oats", name:"Oats (Cooked)", aliases:["oatmeal","dalia oats"], cat:"breakfast", unit:"bowl", per:{cal:190,p:7,c:32,f:4}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1},{l:"1½ bowl",q:1.5}] },
  { id:"dalia", name:"Dalia (Broken Wheat)", aliases:["broken wheat","daliya"], cat:"breakfast", unit:"bowl", per:{cal:210,p:7,c:38,f:3}, portions:[{l:"½ bowl",q:0.5},{l:"1 bowl",q:1}] },
  { id:"sprouts", name:"Sprouts (Mixed)", aliases:["ankurit","moong sprouts"], cat:"protein", unit:"katori", per:{cal:120,p:9,c:16,f:1}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"soya_chunks", name:"Soya Chunks (Cooked)", aliases:["nutrela","soya","meal maker"], cat:"protein", unit:"katori", per:{cal:170,p:26,c:10,f:2}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"peanut_butter", name:"Peanut Butter", aliases:["PB"], cat:"protein", unit:"tbsp", per:{cal:95,p:4,c:3,f:8}, portions:[{l:"1 tbsp",q:1},{l:"2 tbsp",q:2},{l:"3 tbsp",q:3}] },
  { id:"sweet_potato", name:"Sweet Potato (Boiled)", aliases:["shakarkandi"], cat:"snack", unit:"piece", per:{cal:110,p:2,c:26,f:0.1}, portions:[{l:"1 medium",q:1},{l:"2 medium",q:2}] },

  // ── DINNER / MISC ──
  { id:"naan", name:"Naan", aliases:["butter naan","tandoori naan"], cat:"dinner", unit:"piece", per:{cal:260,p:7,c:42,f:6}, portions:[{l:"1 naan",q:1},{l:"2 naan",q:2}] },
  { id:"kulcha", name:"Kulcha", aliases:["amritsari kulcha"], cat:"dinner", unit:"piece", per:{cal:280,p:6,c:40,f:10}, portions:[{l:"1 kulcha",q:1},{l:"2 kulcha",q:2}] },
  { id:"rumali_roti", name:"Rumali Roti", aliases:["roomali roti"], cat:"dinner", unit:"piece", per:{cal:140,p:4,c:26,f:2}, portions:[{l:"1 roti",q:1},{l:"2 roti",q:2}] },
  { id:"salad", name:"Green Salad", aliases:["kachumber","salad"], cat:"snack", unit:"katori", per:{cal:40,p:1,c:8,f:0.5}, portions:[{l:"1 katori",q:1},{l:"2 katori",q:2}] },
  { id:"pickle", name:"Pickle (Achar)", aliases:["achar","mango pickle"], cat:"snack", unit:"tbsp", per:{cal:40,p:0.5,c:2,f:3}, portions:[{l:"1 tbsp",q:1},{l:"2 tbsp",q:2}] },
  { id:"papad", name:"Papad (Roasted)", aliases:["papadum"], cat:"snack", unit:"piece", per:{cal:45,p:3,c:6,f:1}, portions:[{l:"1 papad",q:1},{l:"2 papad",q:2}] },
  { id:"ghee", name:"Ghee", aliases:["clarified butter","desi ghee"], cat:"snack", unit:"tsp", per:{cal:45,p:0,c:0,f:5}, portions:[{l:"1 tsp",q:1},{l:"2 tsp",q:2},{l:"1 tbsp",q:3}] },

  // ── SWEETS / DESSERTS ──
  { id:"gulab_jamun", name:"Gulab Jamun", aliases:["gulab jamun"], cat:"snack", unit:"piece", per:{cal:150,p:2,c:22,f:6}, portions:[{l:"1 piece",q:1},{l:"2 pieces",q:2}] },
  { id:"kheer", name:"Kheer (Rice Pudding)", aliases:["payasam"], cat:"snack", unit:"katori", per:{cal:220,p:5,c:32,f:8}, portions:[{l:"1 katori",q:1},{l:"½ katori",q:0.5}] },
  { id:"ladoo", name:"Besan Ladoo", aliases:["laddu","laddoo"], cat:"snack", unit:"piece", per:{cal:180,p:3,c:20,f:10}, portions:[{l:"1 ladoo",q:1},{l:"2 ladoo",q:2}] },
  { id:"jalebi", name:"Jalebi", aliases:["jilebi"], cat:"snack", unit:"piece", per:{cal:150,p:1,c:25,f:5}, portions:[{l:"2 pieces",q:2},{l:"4 pieces",q:4}] },
  { id:"halwa", name:"Sooji Halwa", aliases:["suji halwa","sheera"], cat:"snack", unit:"katori", per:{cal:300,p:4,c:40,f:14}, portions:[{l:"½ katori",q:0.5},{l:"1 katori",q:1}] },
];
