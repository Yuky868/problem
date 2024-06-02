// export const extractInfoByKeywords = (text) => {
//     const data = {};
    
//     // 定义关键字及其对应的正则表达式
//     const patterns = {
//         'body': /([\s\S]*?)\n(【答案】|$)/,
//         'answer': /【答案】([\s\S]*?)【解析】/g,
//         'explain': /【解析】([\s\S]*?)【分析】/g,
//         'fenxi': /【分析】([\s\S]*?)【详解】/g,
//         'detail': /【详解】([\s\S]*?)/g,
//     };
    
//     // 遍历关键字及其正则表达式进行匹配
//     for (const key in patterns) {
//         // const match = text.match(patterns[key]);
//         const match = patterns[key].exec(text)
//         if (match) {
//             // 去除前后空白并存储值
//             console.log('match',match);
//             data[key] = match[1];
//         } else {
//             data[key] = ""; // 或者可以选择不设置该键，根据需求调整
//         }
//     }
    
//     return data;
// }


// const htmlText = '<p>1. 甲、乙、丙、丁分别代表我国四大地理区域中的 (　　)</p><p><img src="2024516/img-18f80ed15a4_1.png" alt="学科网(www.zxxk.com)--教育资源门户，提供试卷、教案、课件、论文、素材以及各类教学资源下载，还有大量而丰富的教学相关资讯！" /></p><p>A. 北方地区、南方地区、西北地区、青藏地区</p><p>B. 南方地区、青藏地区，北方地区、西北地区</p><p>C. 西北地区、南方地区、北方地区、青藏地区</p><p>D. 西北地区、青藏地区、南方地区、北方地区</p><p>【答案】C</p><p>【解析】</p><p>【分析】</p><p>【详解】读图可知：甲是我国西北地区，西北地区大体位于大兴安岭以西，长城和昆仑山—阿尔金山以北；乙是我国南方地区，南方地区位于秦岭—淮河以南，青藏高原以东，东部、南部临东海、南海；丙是我国的北方地区，北方地区大体位于大兴安岭、乌鞘岭以东，秦岭—淮河以北，东临渤海、黄河；丁是我国的青藏地区，青藏地区位于横断山脉以西，喜马拉雅山以北，昆仑山和阿尔金山以南，故选C。</p>'
// eslint-disable-next-line no-useless-escape
const bt = /<(p|table|tr|td|tbody)\b[^<>]*>.*?<\/(p|table|tr|td|tbody)?>|[^<>\/]*?<\/(p|table|tr|td|tbody)?>|<\/(p|table|tr|td|tbody)?>[^<>\/]*?<(p|table|tr|td|tbody)?>|<img\b[^<>]*>|[^<>\/]+(?=<(p|table|tr|td|tbody)?>)/g
const panduanti = '<p>1. 工人阶级是中国革命的主要力量。（）</p><p>【答案】错</p>'
const arr = panduanti.match(bt)
console.log(arr)

const regex = /（ ([\w对错])+ ）/
for (let index = 0; index < arr.length; index++) {
    const replaced = arr[index].replace(regex, '\uFF08  \uFF09')
    console.log(replaced)
}