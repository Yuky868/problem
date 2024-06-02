// import axios from 'axios';
export const formatContent = (content) => {
    // 正则表达式匹配题目前缀（数字或中文序号）、题干、答案、解析
 const regex = /([0-9]{1,2}[.])/g;

 // 使用正则表达式替换匹配到的部分，为每个匹配项前后添加<div>标签
 const wrappedContent = content.replace(regex, (match, p1, p2) => {
   // 去掉开头可能的空白字符，并为每个部分添加<div>包装
   console.log(match, p1, p2);
   return `<div class="${p1 === '一、' || p1 === '二、' || p1 === '三、' ? 'sectionTitle' : ''}">${p1.trim()}${p2.trim()}</div>`;
 });

 return wrappedContent;

}

// 先匹配大题号，分割成几个大块
export const splitByChineseQuestionNumbers = (text) => {
  // 定义匹配汉字大题号的正则表达式
  const pattern = /([一二三四五六七八九十百千万亿]+、)/g;
   
  // 使用正则表达式找到所有大题号的索引位置
  let indices = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
      indices.push(match.index);
  }
  
  // 根据大题号的位置分割文本
  let startIndex = 0;
  const questions = [];
  indices.forEach((index, i) => {
      // 添加从上一个大题号到当前大题号（不包括）之间的文本
      const questionContent = text.slice(startIndex, index).trim();
      if (questionContent) {
          questions.push(questionContent);
      }
      startIndex = index;
  });

  // 添加最后一个大题号之后的文本
  const lastContent = text.slice(startIndex).trim();
  if (lastContent) {
      questions.push(lastContent);
  }
  questions.shift()
  
  return questions;
}


// 使用小题号再次进行分割
export const splitByQuestionNumbersThenWrap = (inputStr) => {
   // 第一步：移除HTML标签（不移除也可以）
   // const textWithoutTags = inputStr.replace(/<[^>]*>/g, '');
   const textWithoutTags = inputStr;
   
   // 第二步：使用数字题号（数字+英文句点+空格）作为分隔符分割文本
   // 注意：这里需要确保题号后的句点不被其他内容中的句点混淆
   const questions = textWithoutTags.split(/\d+\.\s/);

   // 第三步：处理分割后的数组，为每个题目前后添加<div>标签
   // const wrappedQuestions = questions.map((question, index) => {
   //     // 对于数组中的第一个元素，直接添加开始的<div>
   //     // 其他元素则在前面添加</div>来闭合前一个<div>，然后添加开始的<div>
   //     return (index > 0 ? '</div>\n' : '') + `<div>\n${question}\n`;
   // }).join('');

   // 第四步：确保最后一个<div>也被闭合
   // const output = wrappedQuestions.endsWith('</div>') ? wrappedQuestions : wrappedQuestions + '</div>';

   // return output;

   // 过滤掉可能的空字符串（比如原始字符串以题号开始或结束导致的空元素）
   const nonEmptyQuestions = questions.filter(question => question.trim() !== '');
   nonEmptyQuestions.shift()

   return nonEmptyQuestions;
}


export const base64toBlob = (base64Data, contentType = 'image/png') => {
 const byteCharacters = atob(base64Data);
 const byteArrays = [];

 for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
     const slice = byteCharacters.slice(offset, offset + 1024);
     const byteNumbers = new Array(slice.length);
     for (let i = 0; i < slice.length; i++) {
         byteNumbers[i] = slice.charCodeAt(i);
     }
     const byteArray = new Uint8Array(byteNumbers);
     byteArrays.push(byteArray);
 }

 const blob = new Blob(byteArrays, {type: contentType});
 return blob;
}

export const getUuid = () => {
 return 'xxxxxxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
   const r = (Math.random() * 16) | 0;
   const v = c == 'x' ? r : (r & 0x3) | 0x8;
   return v.toString(16);
 });
};

export const dataURLtoFile = (base64, filename) => {
 // eslint-disable-next-line no-var
 var mime = base64,
   bstr = atob(mime),
   n = bstr.length,
   u8arr = new Uint8Array(n);
 while (n--) {
   u8arr[n] = bstr.charCodeAt(n);
 }
 return new File([u8arr], filename, { type: mime });
};

export const removeTagsButKeepImg = (str) => {

   const parser = new DOMParser();
   const doc = parser.parseFromString(str, 'text/html');
   const body = doc.body;

   function traverseAndCollect(node, result) {

       if (node.nodeType === Node.TEXT_NODE) {
           // 如果是文本节点，直接添加文本内容
           result.push(node.textContent);
       } else if (node.tagName.toLowerCase() === 'img') {
           // 如果是<img>标签，添加outerHTML
           result.push(node.outerHTML);
       } else if(node.tagName.toLowerCase() === 'table') {
            result.push(node.outerHTML);
       } else if (node.childNodes && node.childNodes.length > 0) {
           // 如果是其他元素且有子节点，递归遍历子节点
           for (let i = 0; i < node.childNodes.length; i++) {
               traverseAndCollect(node.childNodes[i], result);
           }
       }
   }

   const contentParts = [];
   traverseAndCollect(body, contentParts);

   return contentParts.join('');
 
}
