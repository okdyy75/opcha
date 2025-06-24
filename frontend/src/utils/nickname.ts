// ニックネーム生成ユーティリティ

const adjectives = [
  'はっぴー', 'くーる', 'すまーと', 'ふれんどりー', 'ぶれいぶ',
  'きゅーと', 'すーぱー', 'ないす', 'ぐれーと', 'ふぁんたすてぃっく'
];

const animals = [
  'ネコ', 'イヌ', 'ウサギ', 'パンダ', 'リス',
  'ハムスター', 'ペンギン', 'ライオン', 'ゾウ', 'キリン'
];

/**
 * ランダムなニックネームを生成する
 * @returns 生成されたニックネーム
 */
export const generateRandomNickname = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${animal}${number}`;
}; 