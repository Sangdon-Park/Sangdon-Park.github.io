// Same chapter, algorithm and callable contract: use the PPTX exercise version.
// Keep legacy IDs in storage so existing answers and submission history survive.
const LAB_DUPLICATES=Object.freeze({
  P13:'P37', P15:'P38', P18:'P40', P19:'P41', P22:'P42',
  P23:'P43', P24:'P44', P26:'P45', P30:'P39', P34:'P46'
});
const canonicalProblemId=id=>LAB_DUPLICATES[id]||id;
