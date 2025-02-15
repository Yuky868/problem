import { removeTagsButKeepImg } from './index'

// 1.6 取消table标签中的贪婪匹配，避免两个table被识别为一个table的问题
const resolve_line_regexp = /<table\b[^<>]*>.*?<\/table>|<(p|tr|td|tbody)\b[^<>]*>.*?<\/(p|tr|td|tbody)>|<\/(p|tr|td|tbody)>[^<>\/]*?<(p|tr|td|tbody)\b[^<>]*>|<img\b[^<>]*>|[^<>\/]+(?=<(p|table|tr|td|tbody)\b)/g;
// const resolve_line_regexp = /<table>.*<\/table>|<(p|table|tr|td|tbody)\b[^<>]*>.*?<\/(p|table|tr|td|tbody)?>|[^<>\/]*?<\/(p|table|tr|td|tbody)?>|<\/(p|table|tr|td|tbody)?>[^<>\/]*?<(p|table|tr|td|tbody)?>|<img\b[^<>]*>|[^<>\/]+(?=<(p|table|tr|td|tbody)?>)/g
const regex_sub_sup = /<sub>([\d\w-]+)<\/sub>|<sup>([\d\w]+)<\/sup>/g;
// 拆分成行数组
export const getLines = function (str) {
    return str.match(resolve_line_regexp)
}

function replaceSubSup(match, p1, p2) {
    if (p1 !== undefined) {
    // 如果是 <sub> 标签，替换为下划线
    return '_' + p1;
    } else if (p2 !== undefined) {
    // 如果是 <sup> 标签，替换为上标符号
    return '^' + p2;
    }
}


export const splitproblem = async (arr, problemSplitType) => {
    console.log('待拆分的数组：',arr)
    const { problemNumType, 
        problemChoiceType, 
        problemAnswerType, 
        problemAnalyseType, 
        problemExplainType,
        problemDetailType,
        // problemSubNumType,
        // problemSubExplainType
    } = problemSplitType
    let numberReg = problemNumType
    let stringArr = []
    let problemInitArr = []
    let problemNumber = 0
    let subProblemNumber = 0

    // 去除多余标签，只保留img/table标签
    for (var i = 0; i < arr.length; i++) {        
        const removeTagString = await removeTagsButKeepImg(arr[i])
        stringArr.push(removeTagString)
    }
    const newStringArr = stringArr.map(str => str.replace(regex_sub_sup, replaceSubSup))
    console.log(222, newStringArr)

    // 需要再次细化一下，没有特殊表示的行，可以通过index的位置来处理
    newStringArr.forEach((str, index) => {
        if (numberReg.test(str)) {
            problemNumber++
            problemInitArr.push({
                startLine: index, // 上一个关键字出现的行数标识
                body: str.replace(numberReg, ''), // 题干
                initChoices: '',
                answer: '', //答案
                explains: '', // 解析
                analysis: '', // 分析
                detail:'', // 详解
                content: [], //不知道是啥字段的放这里
                lastType: 'body', // 最后一个字段的类型
                subproblems: [], // 子题
            })
        } else if (problemAnswerType.test(str)) {
            // 答案
            problemInitArr[problemNumber - 1].answer = str.replace(problemAnswerType, '')
            problemInitArr[problemNumber - 1].lastType = 'answer'
        } else if (problemExplainType.test(str)) {
            // 解析
            problemInitArr[problemNumber - 1].explains = str.replace(problemExplainType, '')
            problemInitArr[problemNumber - 1].lastType = 'explains'
        } else if (problemAnalyseType.test(str)) {
            // 分析
            problemInitArr[problemNumber - 1].analysis = str.replace(problemAnalyseType, '')
            problemInitArr[problemNumber - 1].lastType = 'analysis'
        } else if(problemDetailType.test(str)){
            // 详解
            problemInitArr[problemNumber - 1].detail = str.replace(problemDetailType, '')
            problemInitArr[problemNumber - 1].lastType = 'detail'
        }
        else if (problemChoiceType.exec(str) !== null) {
            // 选项
            if(problemInitArr[problemNumber - 1].lastType === 'body'){
                problemInitArr[problemNumber - 1].initChoices += str
            }
        }
        // else if(problemSubNumType.test(str)){
        //     if (problemInitArr[problemNumber - 1].lastType === 'body') {
        //         problemInitArr[problemNumber - 1].subproblems.push({
        //             body: str,
        //             explains: ''
        //         });
        //     }
        // } 
        // else if(problemSubExplainType.test(str)){
        //     const matchResult = str.match(problemSubExplainType);
        //     if (matchResult) {
        //         const number = parseInt(matchResult[1], 10);
        //         subProblemNumber = number
        //         problemInitArr[problemNumber - 1].subproblems[number - 1].explains = str
        //         problemInitArr[problemNumber - 1].lastType = 'subExplain'
        //         // console.log(2222, number, problemInitArr[problemNumber - 1].subproblems);
        //     }
        // }
        else {
            if (problemNumber !== 0) {
                let { lastType } = problemInitArr[problemNumber - 1]

                // 再筛选一下选项,有些详解会包含选项，需要单独处理
                if (problemChoiceType.test(str) && lastType === 'body') {
                    problemInitArr[problemNumber - 1].initChoices += str
                    return
                }
                switch (lastType) {
                    case 'answer':
                        problemInitArr[problemNumber - 1].answer += str
                        return
                    case 'explains':
                        problemInitArr[problemNumber - 1].explains += str
                        return
                    case 'detail':
                        problemInitArr[problemNumber - 1].detail += str
                        return
                    case 'analysis':
                        problemInitArr[problemNumber - 1].analysis += str
                        return
                    case 'body':
                        problemInitArr[problemNumber - 1].body += str
                        return
                    case 'subExplain':
                        problemInitArr[problemNumber - 1].subproblems[subProblemNumber-1].explains += str
                        return
                }
            }


        }
    })
    const newProblem = problemInitArr.map((el) => {
        if(el.initChoices.length > 0){
          const answers = extractLetters(el.answer)?.map((letter) => findAlphabetPosition(letter))
          let choices = el.initChoices.split(problemChoiceType)?.filter(p => !!p )
          choices = choices.map((c,index) => {
            const correct = answers.findIndex(n => (n-1) === index) !== -1
            return {
                body:c,
                num: String.fromCharCode(65 + index),
                correct
            }
          })
          return {
            ...el,
            choices: choices
          }
        } else {
          return el
        }
      })

    //   console.log('newProblem', newProblem);
    return newProblem
}


function findAlphabetPosition(letter) {
    // 确保输入是单个字母并且是英文字母
    if (letter.length !== 1 || !(/[A-Za-z]/.test(letter))) {
        throw new Error("Input must be a single English letter.");
    }
    
    // 将字母转换为小写进行统一处理
    letter = letter.toLowerCase();
    
    // 计算并返回字母位置
    return letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

function extractLetters(str) {
    // 使用正则表达式匹配所有的字母字符
    const letters = str.match(/[A-Za-z]/g);
    
    // 如果没有找到匹配项，返回空数组，否则返回匹配到的字母数组
    return letters ? letters : [];
  }