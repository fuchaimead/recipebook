// recipe-data.jsx — categories, sample recipes, and the US⇄Metric converter.
// Exports to window: CATEGORIES, SEED_RECIPES, SEED_IDEAS, convertIng, fmtIng, recipeToText,
//   ingredientsToText, convertText, fmtMeta

// ── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'appetizers', name: 'Appetizers & Sides', blurb: 'Starters, snacks, salads & sides' },
  { id: 'breads',     name: 'Breads',             blurb: 'Loaves, rolls & doughs' },
  { id: 'mains',      name: 'Mains',              blurb: 'Dinners & entrées' },
  { id: 'soups',      name: 'Soups',              blurb: 'Stews, chowders & broths' },
  { id: 'desserts',   name: 'Desserts',           blurb: 'Cookies, cakes & pies' },
];

// ── Amount formatting ─────────────────────────────────────────
const FRACTIONS = [
  [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.375, '⅜'],
  [0.5, '½'], [0.625, '⅝'], [0.667, '⅔'], [0.75, '¾'], [0.875, '⅞'],
];
function fmtFraction(n) {
  if (n == null) return '';
  const whole = Math.floor(n + 1e-9);
  const frac = n - whole;
  let best = '', bestErr = 0.04;
  for (const [v, g] of FRACTIONS) {
    const e = Math.abs(frac - v);
    if (e < bestErr) { best = g; bestErr = e; }
  }
  if (best) return (whole ? whole + ' ' : '') + best;
  if (frac < 0.04) return String(whole);
  return String(Math.round(n * 100) / 100);
}
function roundMetric(n) {
  if (n >= 100) return Math.round(n / 5) * 5;
  if (n >= 20)  return Math.round(n);
  return Math.round(n * 10) / 10;
}

// ── Conversion factors ────────────────────────────────────────
const ML = { cup: 236.6, tbsp: 14.79, tsp: 4.93 };
const COUNT_UNITS = ['', 'clove', 'cloves', 'large', 'medium', 'small', 'can', 'pinch', 'sprig', 'handful', 'stick'];

// Convert one ingredient to the target system. Returns { amount, unit }.
function convertIng(ing, system) {
  const { q, u } = ing;
  if (q == null) return { amount: '', unit: u || '' };

  if (system === 'us') {
    return { amount: fmtFraction(q), unit: u || '' };
  }

  // ---- metric ----
  if (u === 'cup' || u === 'tbsp' || u === 'tsp') {
    if (ing.density) {
      const perUnit = ing.density * (ML[u] / ML.cup); // grams
      return { amount: String(roundMetric(q * perUnit)), unit: 'g' };
    }
    return { amount: String(roundMetric(q * ML[u])), unit: 'ml' };
  }
  if (u === 'oz')  return { amount: String(roundMetric(q * (ing.fluid ? 29.57 : 28.35))), unit: ing.fluid ? 'ml' : 'g' };
  if (u === 'lb')  return { amount: String(roundMetric(q * 453.6)), unit: 'g' };
  if (u === 'g' || u === 'ml' || u === 'kg') return { amount: fmtFraction(q), unit: u };
  // counts / pieces — unchanged
  return { amount: fmtFraction(q), unit: u || '' };
}

// One ingredient → plain string e.g. "360 g all-purpose flour, sifted"
function fmtIng(ing, system) {
  const { amount, unit } = convertIng(ing, system);
  const head = [amount, unit].filter(Boolean).join(' ');
  let line = head ? `${head} ${ing.item}` : ing.item;
  if (ing.note) line += `, ${ing.note}`;
  return line;
}

// ── Temperature / size conversion inside free instruction text ──
function convertText(text, system) {
  if (system !== 'metric') return text;
  let out = text.replace(/(\d{2,3})\s*°?\s*F\b/g, (_, f) => {
    const c = Math.round(((+f - 32) * 5) / 9 / 5) * 5;
    return `${c}°C`;
  });
  out = out.replace(/(\d+(?:\.\d+)?)[\s-]*inch(es)?/gi, (_, n) => {
    const cm = Math.round(+n * 2.54);
    return `${cm} cm`;
  });
  return out;
}

// ── Whole-recipe → clipboard text ─────────────────────────────
function fmtMeta(r) {
  const bits = [];
  if (r.prep) bits.push(`Prep ${r.prep}`);
  if (r.cook) bits.push(`Cook ${r.cook}`);
  if (r.yield) bits.push(r.yield);
  return bits.join('  ·  ');
}
function ingredientsToText(r, system) {
  return r.ingredients.map(i => '• ' + fmtIng(i, system)).join('\n');
}
function recipeToText(r, system) {
  const cat = CATEGORIES.find(c => c.id === r.cat);
  const lines = [];
  lines.push(r.title.toUpperCase());
  const meta = [cat ? cat.name : '', fmtMeta(r)].filter(Boolean).join('  ·  ');
  if (meta) lines.push(meta);
  lines.push('');
  lines.push('INGREDIENTS');
  lines.push(ingredientsToText(r, system));
  lines.push('');
  lines.push('METHOD');
  r.steps.forEach((s, i) => lines.push(`${i + 1}. ${convertText(s, system)}`));
  if (r.notes) { lines.push(''); lines.push('NOTES'); lines.push(r.notes); }
  if (r.source) { lines.push(''); lines.push(`Source: ${r.source}`); }
  return lines.join('\n');
}

// ── Seed recipes ──────────────────────────────────────────────
const li = (s) => ({ q: null, u: '', item: s });

const SEED_RECIPES = [
  {
    id: 'naan', cat: 'breads', fav: false, title: 'Naan Bread',
    prep: '', cook: '', yield: '8 naan', source: '', blurb: '', notes: '',
    ingredients: [
      '1 tsp sugar (5 g)', '½ cup warm water', '¼ oz (2¼ tsp) active dry yeast',
      '2¼ cups all-purpose flour (315 g)', '½ cup plain yogurt', '½ tsp salt',
      '1 tbsp oil', 'Oil, for greasing the skillet', '3 tbsp melted butter',
    ].map(li),
    steps: [
      'In a small bowl, stir together the sugar, warm water and yeast. The yeast is activated when it becomes foamy, about 10 minutes.',
      'Transfer the flour to a flat surface and make a well in the middle. Add the yeast mixture, yogurt, salt and oil, and knead until the surface is smooth and shiny, about 10 minutes.',
      'Cover the dough with a damp cloth and let it rise in a warm place until doubled in size, about 1 hour.',
      'Divide the dough into 8 equal portions. Roll each to an 8-inch circle with a rolling pin.',
      'Heat a skillet (cast-iron preferred) over high heat and lightly grease it. Place a dough round on the skillet; when it puffs and bubbles with burnt spots, flip and cook the other side. Repeat with the rest.',
      'Brush the naan with melted butter and serve warm.',
    ],
  },
  {
    id: 'moroccan-chicken', cat: 'mains', fav: false, title: 'Moroccan Chicken',
    prep: '15 min', cook: '45 min', yield: 'Serves 4–6', source: '', blurb: '',
    notes: "Don't fret over trimming the thighs — the skin comes off midway and most of the fat drains. Cracked green olives are split before curing so the brine penetrates; any green olive works. Make-ahead: after cooking the carrots, refrigerate up to 2 days; rewarm gently, then add the olives and remaining ingredients.",
    ingredients: [
      '1 tsp paprika', '1 tsp ground cumin', '¼ tsp cayenne pepper', '½ tsp ground ginger',
      '½ tsp ground coriander', '¼ tsp ground cinnamon', '1 lemon', '5 cloves garlic, minced',
      '8 bone-in, skin-on chicken thighs (about 4 lb), trimmed', 'Salt and ground black pepper',
      '1 tbsp olive oil', '1 large yellow onion, halved and cut into ¼-in slices',
      '2 tbsp all-purpose flour', '1¾ cups chicken broth', '2 tbsp honey',
      '2 large or 3 medium carrots, peeled and cut into ½-inch coins',
      '½ cup cracked green olives, pitted and halved', '2 tbsp chopped fresh cilantro',
    ].map(li),
    steps: [
      'Combine the spices in a small bowl and set aside. Zest the lemon; mix 1 tsp zest with 1 minced garlic clove and set aside.',
      'Season the chicken with 2 tsp salt and ½ tsp pepper. Heat the oil in a large Dutch oven over medium-high until just smoking. Brown the chicken skin-side down until deep golden, about 5 minutes; flip and brown 4 minutes more. Transfer to a plate, peel off and discard the skin, and pour off all but 1 tbsp of fat.',
      'Reduce heat to medium. Add the onion and cook until browned at the edges but still holding shape, 5–7 minutes. Add the remaining garlic and cook until fragrant, about 30 seconds. Add the spices and flour and cook, stirring, about 30 seconds. Stir in the broth, honey, remaining lemon zest and ¼ tsp salt, scraping up any browned bits. Return the chicken with its juices, cover, and simmer over medium-low for 10 minutes.',
      'Add the carrots, cover, and simmer until the chicken is cooked through and the carrots are tender-crisp, about 10 minutes more.',
      'Stir in the olives, reserved zest-garlic mixture, cilantro and 1 tbsp lemon juice. Adjust seasoning with salt, pepper and more lemon juice. Serve with couscous.',
    ],
  },
  {
    id: 'meatballs', cat: 'mains', fav: false, title: 'Meatballs',
    prep: '', cook: '12 min', yield: '', source: '', blurb: '', notes: '',
    ingredients: [
      '1 cup Panko breadcrumbs', '⅓ cup milk', '1 lb ground beef', '1 lb ground pork',
      '4 cloves garlic, pressed or minced', '2 eggs', '1 cup (1½ oz) finely grated Parmesan',
      '¼ cup finely chopped fresh Italian herbs (half parsley, half basil)', '¼ cup grated yellow onion',
      '2 tsp Worcestershire sauce', '1 tsp dried oregano', '1 tsp fine sea salt',
      '½ tsp black pepper', '¼ tsp crushed red pepper flakes',
    ].map(li),
    steps: [
      'Make the panade: in a large bowl, stir together the panko and milk. Let soak 5–10 minutes while you prep the rest.',
      'Add the beef, pork, garlic, eggs, Parmesan, herbs, onion and Worcestershire to the bowl. Sprinkle the oregano, salt, pepper and red pepper flakes on top. Mix with your hands until just combined — don't over-mix.',
      'Optional: cover and chill 1 hour to make the mixture easier to form.',
      'Heat the oven to 425°F and line a rimmed baking sheet with parchment.',
      'Scoop and roll into 2-tablespoon balls (grease your hands with a little olive oil) and place on the sheet.',
      'Bake 10–12 minutes, until the internal temperature reaches 160°F. Serve immediately.',
    ],
  },
  {
    id: 'croque-madame', cat: 'mains', fav: false, title: 'Croque Madame',
    prep: '', cook: '', yield: 'Serves 2', source: '', blurb: '',
    notes: 'Ingredients only for now — add the method when you make it.',
    ingredients: [
      '2 tbsp butter', '2 tbsp flour', '1¼ cups milk', 'Salt and pepper, to taste',
      'Freshly grated nutmeg, to taste', '4 thin slices of rustic bread', '1 tbsp melted butter',
      'Butter, for toasting bread and cooking eggs', 'Sliced ham', '½ cup shredded gruyère cheese', '2 eggs',
    ].map(li),
    steps: [],
  },
  {
    id: 'gingerbread', cat: 'desserts', fav: false, title: 'Soft Gingerbread Cookies',
    prep: '', cook: '10 min', yield: '~48 cookies', source: '', blurb: '',
    notes: 'Makes about 45–50 mid-sized cookies (or ~16 large gingerbread men). Don't overmix. Bake same-size cookies together. Powdered-sugar icing: 2 cups powdered sugar with 1–2 tbsp lemon juice, water or half-and-half. Dough or baked cookies freeze up to 3 months.',
    ingredients: [
      '1 cup butter, softened', '1 cup light brown sugar', '1 large egg', '1 cup molasses (not blackstrap)',
      '1 tbsp apple cider or white wine vinegar', '2 tsp vanilla extract',
      'Dry ingredients:', '5 cups flour', '1 tsp baking soda', '½ tsp salt',
      'Gingerbread spice mix:', '1 tbsp ground ginger', '1 tbsp ground cinnamon',
      '½ tsp ground allspice', '½ tsp ground cloves', '¼ tsp ground nutmeg',
    ].map(li),
    steps: [
      'Beat the butter and brown sugar on medium-high until combined. Add the egg, molasses, vinegar and vanilla and beat on medium-low until fully combined.',
      'In a separate bowl, mix the dry ingredients and the gingerbread spices until well combined.',
      'Add the dry mixture to the molasses mixture and mix on low just until it forms a soft dough.',
      'Cover and chill at least 3 hours or overnight (let it sit 15 minutes at room temperature before rolling if chilled overnight).',
      'Preheat the oven to 350°F. Divide the dough in two and roll each half to ¼-inch thick on a lightly floured surface.',
      'Cut out cookies and place 1 inch apart on lined sheets, keeping similar sizes together.',
      'Bake: medium cookies 8–10 minutes, large gingerbread men 12–14 minutes, small cookies 6–8 minutes. They should spring back when touched — don't overbake.',
      'Cool on the sheet a couple of minutes, then transfer to a rack to cool completely before decorating.',
    ],
  },
  {
    id: 'chelsea-buns', cat: 'desserts', fav: false, title: "Dan's Spiced Orange Chelsea Buns",
    prep: '', cook: '20 min', yield: '12 buns', source: '', blurb: '', notes: '',
    ingredients: [
      'For the dough:', '200 ml whole milk', '50 g unsalted butter', '75 g caster sugar', '1 tsp salt',
      '1 tsp ground cinnamon', '½ tsp ground nutmeg', 'Finely grated zest of 1 large orange',
      '500 g strong white bread flour', '10 g fast-action dried yeast', '2 large eggs', '1 tsp orange extract',
      'For the filling:', '150 g sultanas', '3 tbsp brandy', '2 large oranges, quartered',
      '300 g caster sugar', '100 g light brown soft sugar', '1 tsp ground cinnamon', '½ tsp ground nutmeg',
      '50 g unsalted butter, softened, for brushing',
      'For the icing:', '100 g icing sugar', 'A squeeze of orange juice',
    ].map(li),
    steps: [
      'Make the dough: warm the milk and butter in the microwave 15–20 seconds until the butter is almost melted.',
      'Pour into a stand mixer fitted with the dough hook. Add the remaining dough ingredients and mix on slow about 7 minutes, until smooth and elastic. Cover and leave to rise about 1 hour, until doubled.',
      'Meanwhile, make the filling: heat the sultanas and brandy gently 1–2 minutes until plumped, then cool in a bowl with any remaining brandy.',
      'Peel the orange quarters and cut the peel into 5 mm strips (reserve the flesh for the icing). Boil the strips in water about 10 minutes; change the water and boil again, then once more.',
      'Drain. Add 300 g caster sugar and 150 ml water to the pan and heat until dissolved; add the peel, boil 5 minutes, then drain (reserve the syrup). Once cool, dice the peel. Combine the brown sugar and spices in a bowl.',
      'Punch down the risen dough on a floured surface and roll into a 35–40 cm square. Preheat the oven to 400°F.',
      'Spread the 50 g softened butter over the dough. Sprinkle over the spiced sugar and press gently. Scatter over the sultanas and candied peel.',
      'Roll up tightly from the edge closest to you. Trim the ends and cut into 12 pieces. Place cut-side up in a buttered pan in 3 rows of 4. Cover and leave about 1 hour, until risen to the top of the tin.',
      'Bake 20 minutes, until golden brown. Cool in the tin 15 minutes, then turn out onto a rack. Brush with warmed reserved orange syrup to glaze.',
      'Make the icing: mix the icing sugar with 1–2 tsp reserved orange juice. Drizzle in diagonal lines over the buns.',
    ],
  },
  {
    id: 'noknead-sandwich', cat: 'breads', fav: false, title: 'No-Knead Sandwich Bread',
    prep: '', cook: '30 min', yield: '1 loaf', source: '', blurb: '', notes: '',
    ingredients: [
      '400 g flour', '2¼ tsp instant yeast', '25 g sugar', '7 g salt',
      '125 ml hot tap water', '125 ml milk', '50 g butter',
    ].map(li),
    steps: [
      'Add the wet ingredients to the dry and mix to a dough.',
      'Rest 15 minutes, then lift and fold. Repeat the rest-and-fold four times (15 minutes each).',
      'Roll the dough out, then roll it up into a log.',
      'Rest about 2 hours, until doubled in size.',
      'Bake at 350°F for 20–35 minutes.',
    ],
  },
  {
    id: 'noknead-dutch', cat: 'breads', fav: false, title: 'No-Knead Dutch Oven Bread',
    prep: '', cook: '30 min', yield: '1 loaf', source: '', blurb: '', notes: '',
    ingredients: [
      '400 g bread flour', '1 g yeast (¼ tsp)', '10 g salt (1½ tsp)', '1⅓ cups room-temperature water',
    ].map(li),
    steps: [
      'Mix to a shaggy dough, cover, and leave 12–24 hours.',
      'Shape into a heavily floured round boule and place onto floured parchment paper. Heavily flour a towel.',
      'Set the oven as hot as it will go for 1 hour with the Dutch oven inside.',
      'Score the top of the dough.',
      'Bake for 30 minutes, spraying with water at the beginning and halfway through.',
    ],
  },
  {
    id: 'baguette', cat: 'breads', fav: false, title: 'Baguette',
    prep: '', cook: '25 min', yield: '4 baguettes', source: '', blurb: '', notes: '',
    ingredients: [
      'Olive oil, for greasing', '500 g strong white bread flour, plus extra for dusting',
      '10 g salt', '10 g instant yeast', '370 ml cool water',
    ].map(li),
    steps: [
      'Lightly oil a 2.4-litre square plastic container (a square tub helps shape the dough).',
      'Put the flour, salt and yeast in a mixer with a dough hook (keep salt off the yeast). Add three-quarters of the water and mix slowly; as it comes together, add the rest and mix on medium 5–7 minutes, until glossy and elastic.',
      'Tip into the tub, cover, and leave 1 hour until at least doubled.',
      'Dredge a linen couche with flour and lightly flour the work surface.',
      'Tip the dough out gently to keep the air in. Divide into 4 pieces.',
      'Shape each piece into an oblong, fold the sides in, and roll into a sausage with a smooth top. Roll out from the middle to 30 cm long.',
      'Lay each baguette along the couche, pleating the cloth between them. Cover and leave 1 hour, until doubled and springy.',
      'Preheat the oven to 475°F with a roasting tray on the bottom.',
      'Dust the baguettes with flour and slash each 4 times on the diagonal.',
      'Fill the tray with hot water for steam and bake 20–25 minutes, until golden with a slight sheen. Cool on a rack.',
    ],
  },
  {
    id: 'fruit-nut-loaf', cat: 'breads', fav: false, title: 'Fruit & Nut Loaf',
    prep: '', cook: '55 min', yield: '1 loaf', source: '', blurb: '', notes: '',
    ingredients: [
      '1 cup dried cranberries (130 g)', '¾ cup golden raisins (100 g)', 'Zest and juice of 1 orange',
      '3⅓ cups all-purpose or bread flour (445 g)', '1½ tsp salt', '½ tsp instant or rapid-rise yeast',
      '½ cup chopped pecans or walnuts (50 g)', 'Tepid water',
    ].map(li),
    steps: [
      'Combine the cranberries, raisins and orange juice in a small bowl. Cover and microwave until steaming, about 1 minute. Let soften about 15 minutes, then drain, reserving the juice. Add room-temperature water to the soaking liquid to measure 1½ cups.',
      'In a large bowl, whisk the flour and salt. Add the yeast, orange zest, cranberries, raisins and nuts and stir to combine. Add the water and stir until all the flour is incorporated.',
      'Cover with plastic wrap and leave at room temperature (about 70°F) for 12–20 hours, until well risen and bubbly on the surface.',
      'Cut a 12-inch square of parchment and coat lightly with cooking spray.',
      'Turn the dough onto a well-floured surface, sprinkle with more flour, stretch it up and fold over a few times — don't overwork it.',
      'Shape into a ball by pulling the edges to the middle. Transfer seam-side down to the parchment and coat the surface lightly with spray.',
      'Lift the dough by the parchment corners into a large Dutch oven. Cover loosely and let rise in a warm spot until doubled, about 2 hours.',
      'Dust the top with flour and cut a 6-inch, ½-inch-deep slit. Cover with the lid and put into a cold oven.',
      'Heat the oven to 450°F and bake 30 minutes (start the timer as you put it in).',
      'Remove the lid and bake 25–35 minutes more, until deep golden and 205–210°F inside. Tent with foil if browning too fast. Cool completely before slicing.',
    ],
  },
  {
    id: 'pineapple-carrot-cake', cat: 'desserts', fav: false, title: 'Pineapple Carrot Cake',
    prep: '', cook: '50 min', yield: '9×13 cake', source: '', blurb: '', notes: '',
    ingredients: [
      '2½ cups (312 g) all-purpose flour', '2 tsp baking powder', '1 tsp baking soda', '½ tsp salt',
      '1½ tsp ground cinnamon', '½ tsp each ground cloves, ginger and nutmeg',
      '1 cup (240 ml) canola or vegetable oil', '1¼ cups (250 g) packed light or dark brown sugar',
      '⅓ cup (67 g) granulated sugar', '4 large eggs, at room temperature', '1 tsp pure vanilla extract',
      '2 cups (260 g) shredded carrots (about 4 large)', '1 cup (8 oz) crushed pineapple, drained',
      '1 cup (125 g) chopped walnuts',
      'Cream cheese frosting:', '8 oz (226 g) full-fat brick cream cheese, softened',
      '½ cup (113 g) unsalted butter, softened', '3 cups (360 g) confectioners' sugar, plus ¼ cup if needed',
      '1 tsp pure vanilla extract', '⅛ tsp salt',
    ].map(li),
    steps: [
      'Preheat the oven to 350°F and grease a 9×13-inch pan.',
      'Whisk the flour, baking powder, baking soda, salt and spices in a large bowl. Set aside.',
      'Whisk the oil, both sugars, eggs and vanilla in a medium bowl. Pour into the dry ingredients and whisk until combined. Fold in the carrots, pineapple and walnuts.',
      'Spread the batter into the pan and bake 45–55 minutes, until a toothpick in the center comes out clean. Tent with foil if the top browns too fast.',
      'Cool completely on a rack (after ~45 minutes you can chill it to speed things up).',
      'Make the frosting: beat the cream cheese and butter on high until smooth. Add the confectioners' sugar, vanilla and salt; beat on low 30 seconds, then high 2 minutes. Add the extra ¼ cup sugar for a thicker frosting.',
      'Spread over the cooled cake and refrigerate 30 minutes before serving. Store covered in the fridge up to 5 days.',
    ],
  },
  {
    id: 'oatmeal-cranberry', cat: 'desserts', fav: false, title: 'Oatmeal Cranberry Cookies',
    prep: '20 min', cook: '10 min', yield: '36 cookies', source: '', blurb: '',
    notes: 'Don't overbake — the middles should still be soft when you pull them out; they firm up as they cool. Use room-temperature eggs. Press a few extra cranberries on top before baking for a prettier look.',
    ingredients: [
      '1½ cups all-purpose flour (180 g)', '1 tsp baking soda', '1 tsp ground cinnamon', '¾ tsp salt',
      '1 cup unsalted butter, at room temperature (2 sticks)', '1 cup packed light brown sugar (220 g)',
      '¼ cup granulated sugar (50 g)', '2 large eggs, at room temperature', '1 tsp vanilla extract',
      '3 cups old-fashioned rolled oats (336 g)', '1½ cups sweetened dried cranberries (170 g)',
    ].map(li),
    steps: [
      'Preheat the oven to 350°F and line baking sheets with parchment.',
      'In a medium bowl, whisk the flour, baking soda, cinnamon and salt.',
      'Beat the butter and sugars on medium until light and fluffy, about 3 minutes. Add the eggs one at a time, beating after each, then beat in the vanilla.',
      'On low, add the flour mixture until just combined. Beat in the oats and cranberries just until combined.',
      'Scoop 1½-inch balls onto the sheets about 1½ inches apart. Bake one tray at a time 10–12 minutes, until lightly browned. Cool on the pan 2 minutes, then transfer to a rack.',
    ],
  },
  {
    id: 'white-choc-macadamia', cat: 'desserts', fav: false, title: 'White Chocolate Macadamia Cookies',
    prep: '', cook: '12 min', yield: '~18 large cookies', source: '', blurb: '', notes: '',
    ingredients: [
      '3 cups (381 g) all-purpose flour', '2 tsp cornstarch', '1 tsp baking soda', '1 tsp baking powder',
      '1 tsp fine sea salt', '2 sticks (226 g) unsalted butter, at cool room temperature',
      '1 cup (200 g) lightly packed light brown sugar', '½ cup (100 g) granulated sugar',
      '2 large eggs plus 1 egg yolk, at cool room temperature', '2 tsp vanilla extract',
      '1½ cups (255 g) white chocolate chips', '1½ cups (210 g) chopped unsalted macadamia nuts',
    ].map(li),
    steps: [
      'If baking right away, preheat the oven to 350°F and line baking sheets with parchment.',
      'In a medium bowl, whisk the flour, cornstarch, baking soda, baking powder and salt.',
      'Cream the butter and sugars on medium-high until light and fluffy, 2–3 minutes. Add the eggs and yolk one at a time, beating well after each, then add the vanilla. Slowly beat in the flour mixture. Stir in the white chocolate chips and macadamia nuts.',
      'If time permits, wrap the dough and refrigerate 24–72 hours, then let it sit until just soft enough to scoop.',
      'Using a 3-tablespoon scoop, drop balls onto the sheets at least 2½ inches apart.',
      'Bake 11–12 minutes, until golden brown. Cool 5 minutes, then transfer to racks. Store airtight up to 3 days.',
    ],
  },
];

// ── Recipe ideas ──────────────────────────────────────────────
// A running list of recipes to enter later, imported from the family list.
// Each is just a title (+ note & category) and is fully editable in-app.
const idea = (title, cat, note) => ({
  id: 'i-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  title, cat, note: note || '',
});
const SEED_IDEAS = [
  // To make soon
  idea('Beef Wellington', 'mains', 'To make soon'),
  idea('Orange chicken', 'mains', 'To make soon'),
  idea('Sweet and sour pork', 'mains', 'To make soon'),
  idea('Jalapeño popper coins', 'appetizers', 'To make soon'),
  idea('Latkes', 'appetizers', 'To make soon'),
  idea('Carrot cake', 'desserts', 'To make soon'),
  idea('Homemade snowballs', 'desserts', 'To make soon'),
  idea('Tres leches', 'desserts', 'To make soon'),
  idea('Key lime pie', 'desserts', 'To make soon'),
  idea('Lemon meringue pie', 'desserts', 'To make soon'),
  idea('Coconut cream pie', 'desserts', 'To make soon'),
  idea('Boston cream pie', 'desserts', 'To make soon'),
  idea('Piña colada dessert', 'desserts', 'To make soon'),
  // Appetizers, sides & salads
  idea('Jalapeño poppers', 'appetizers', ''),
  idea('Chicken wings', 'appetizers', ''),
  idea('Jerky', 'appetizers', ''),
  idea('Pasta salad', 'appetizers', 'Salad'),
  idea('Potato salad', 'appetizers', 'Salad'),
  idea('Costa salad', 'appetizers', 'Salad'),
  // Breads
  idea('Bagels', 'breads', ''),
  idea('Pretzels', 'breads', ''),
  idea('Sourdough', 'breads', ''),
  idea('Sandwich bread', 'breads', ''),
  idea('Rolls', 'breads', ''),
  idea('Cornbread', 'breads', ''),
  idea('Pizza', 'breads', ''),
  idea('Danish', 'breads', ''),
  idea('Crackers', 'breads', ''),
  idea('Granola bars', 'breads', ''),
  idea('Energy bars', 'breads', ''),
  idea('Chex mix', 'breads', ''),
  // Mains — by cuisine
  idea('Tamales', 'mains', 'Mexican'),
  idea('Tacos', 'mains', 'Mexican'),
  idea('Enchiladas', 'mains', 'Mexican'),
  idea('Quesabirria', 'mains', 'Mexican'),
  idea('Meatball sub', 'mains', 'American'),
  idea('Italian sandwich', 'mains', 'American'),
  idea('Eggs Benedict', 'mains', 'American'),
  idea('Chili', 'mains', 'American'),
  idea('BBQ', 'mains', 'American'),
  idea('Red beans and rice', 'mains', 'American'),
  idea('Gumbo', 'mains', 'American'),
  idea('Quiche', 'mains', 'American'),
  idea('Philly cheesesteak', 'mains', 'American'),
  idea('Taco Bell Crunchwrap', 'mains', 'American'),
  idea('Steamed buns', 'mains', 'Chinese'),
  idea('Dumplings', 'mains', 'Chinese'),
  idea('Fried rice', 'mains', 'Chinese'),
  idea('Tomato and egg', 'mains', 'Chinese'),
  idea('Chow mein', 'mains', 'Chinese'),
  idea('Broccoli beef', 'mains', 'Chinese'),
  idea('Indian curry', 'mains', 'Indian'),
  idea('Samosas', 'mains', 'Indian'),
  idea('Butter chicken', 'mains', 'Indian'),
  idea('Thai curry', 'mains', 'Thai'),
  idea('Banh mi', 'mains', 'Thai'),
  idea('Lasagna', 'mains', 'Italian'),
  idea('Sausage and penne', 'mains', 'Italian'),
  idea('Chicken marsala', 'mains', 'Italian'),
  idea('Lemon pasta', 'mains', 'Italian'),
  // Soups
  idea('Minestrone', 'soups', ''),
  idea('Chicken and gnocchi', 'soups', ''),
  idea('Chicken noodle', 'soups', ''),
  idea('Beef stew', 'soups', ''),
  idea('Potato soup', 'soups', ''),
  idea('Tomato soup', 'soups', ''),
  idea('Corn chowder', 'soups', ''),
  idea('Ham and bean soup', 'soups', ''),
  // Desserts
  idea('Hummingbird cake', 'desserts', 'sallysbakingaddiction.com'),
  idea('Chocolate chip cookies', 'desserts', ''),
  idea('Banana cream pie', 'desserts', ''),
];

// Generic sample ideas for brand-new accounts (see STARTER_RECIPES above).
const STARTER_IDEAS = [
  idea('Garlic bread', 'breads', ''),
  idea('Caesar salad', 'appetizers', ''),
  idea('Spaghetti & meatballs', 'mains', ''),
  idea('Chicken noodle soup', 'soups', ''),
  idea('Guacamole', 'appetizers', ''),
  idea('Apple pie', 'desserts', ''),
];

// ── Shareable link encode/decode (serverless: recipe rides in the URL) ──
function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}
// Strip device-only/heavy fields (photo, id, fav) before packing into a link.
function encodeRecipeToParam(r) {
  const slim = {
    cat: r.cat, title: r.title, prep: r.prep, cook: r.cook, yield: r.yield, total: r.total,
    source: r.source, blurb: r.blurb, notes: r.notes,
    ingredients: r.ingredients, steps: r.steps,
  };
  Object.keys(slim).forEach(k => (slim[k] == null || slim[k] === '') && delete slim[k]);
  try { return b64urlEncode(JSON.stringify(slim)); } catch (e) { return ''; }
}
function decodeRecipeFromParam(param) {
  try {
    const obj = JSON.parse(b64urlDecode(param));
    if (!obj || typeof obj.title !== 'string') return null;
    return obj;
  } catch (e) { return null; }
}

// ── Starter set for brand-new accounts ────────────────────────
// Generic samples shown to a NEW user on first sign-in — deliberately NOT the
// family book. Existing accounts load from the cloud and never see these.
const STARTER_RECIPES = [
  {
    id: 'starter-banana-bread', cat: 'breads', fav: false, title: 'Banana Bread',
    prep: '10 min', cook: '55 min', yield: '1 loaf', source: '', blurb: '',
    notes: 'A sample recipe to show how things look — feel free to edit or delete it.',
    ingredients: [
      '3 ripe bananas, mashed', '⅓ cup melted butter', '¾ cup sugar', '1 egg, beaten',
      '1 tsp vanilla', '1 tsp baking soda', 'Pinch of salt', '1½ cups all-purpose flour',
    ].map(li),
    steps: [
      'Heat the oven to 350°F and butter a 4x8-inch loaf pan.',
      'Mix the mashed bananas with the melted butter, then stir in the sugar, egg and vanilla.',
      'Sprinkle the baking soda and salt over the mixture and stir in. Add the flour and mix until just combined.',
      'Pour into the pan and bake about 55 minutes, until a toothpick comes out clean. Cool before slicing.',
    ],
  },
  {
    id: 'starter-tomato-soup', cat: 'soups', fav: false, title: 'Tomato Basil Soup',
    prep: '10 min', cook: '25 min', yield: 'Serves 4', source: '', blurb: '',
    notes: 'A sample recipe — swap in your own favorites anytime.',
    ingredients: [
      '2 tbsp olive oil', '1 onion, diced', '2 cloves garlic, minced',
      '2 (14 oz) cans crushed tomatoes', '2 cups vegetable broth',
      'Handful of fresh basil', 'Salt and pepper', 'Splash of cream (optional)',
    ].map(li),
    steps: [
      'Warm the oil in a pot over medium heat. Cook the onion until soft, about 5 minutes, then add the garlic for 30 seconds.',
      'Add the tomatoes and broth. Simmer for 20 minutes.',
      'Blend smooth, stir in the basil and season with salt and pepper. Add a splash of cream if you like.',
    ],
  },
  {
    id: 'starter-choc-chip', cat: 'desserts', fav: false, title: 'Chocolate Chip Cookies',
    prep: '15 min', cook: '11 min', yield: 'About 24 cookies', source: '', blurb: '',
    notes: 'A sample recipe to get you started.',
    ingredients: [
      '1 cup butter, softened', '¾ cup sugar', '¾ cup brown sugar', '2 eggs', '1 tsp vanilla',
      '2¼ cups all-purpose flour', '1 tsp baking soda', '½ tsp salt', '2 cups chocolate chips',
    ].map(li),
    steps: [
      'Heat the oven to 375°F. Cream the butter with both sugars until fluffy, then beat in the eggs and vanilla.',
      'Stir together the flour, baking soda and salt, then mix into the wet ingredients. Fold in the chocolate chips.',
      'Drop rounded tablespoons onto baking sheets and bake 9–11 minutes, until the edges are golden.',
    ],
  },
];

Object.assign(window, {
  CATEGORIES, SEED_RECIPES, SEED_IDEAS, STARTER_RECIPES, STARTER_IDEAS, convertIng, fmtIng, recipeToText,
  ingredientsToText, convertText, fmtMeta, encodeRecipeToParam, decodeRecipeFromParam,
});
