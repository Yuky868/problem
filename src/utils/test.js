import { removeTagsButKeepImg } from './index'

const resolve_line_regexp = /<table>.*<\/table>|<(p|table|tr|td|tbody)\b[^<>]*>.*?<\/(p|table|tr|td|tbody)?>|[^<>\/]*?<\/(p|table|tr|td|tbody)?>|<\/(p|table|tr|td|tbody)?>[^<>\/]*?<(p|table|tr|td|tbody)?>|<img\b[^<>]*>|[^<>\/]+(?=<(p|table|tr|td|tbody)?>)/g
// 拆分成行数组
export const getLines = function (str) {
    return str.match(resolve_line_regexp)
}

// 区分题号
const num = /^(\d+)[．.,、，:： )](.+)|^第(\d+)题(.+)/g,
    e = /<p\b[^<>]*>|<\/p>/g,
    t = /^<br\/>/g,
    s = /<(\w)+(\d)?\b[^<>]*>|<\/(\w)+(\d)?>|<(\w)+(\d)?\b[^<>]*(\/)?>/g,
    a = /\s/g,
    tags =
        /<(p|table|tr|td|tbody)\b[^<>]*>.*?<\/(p|table|tr|td|tbody)?>|[^<>\/]*?<\/(p|table|tr|td|tbody)?>|<\/(p|table|tr|td|tbody)?>[^<>\/]*?<(p|table|tr|td|tbody)?>|<img\b[^<>]*>|[^<>\/]+(?=<(p|table|tr|td|tbody)?>)/g,

    ans = /^答案|^\[答案\]|^【答案】|^答案：|^答案:|【答案】/,
    exp = /^解析|^\[解析\]|【解析】|^解析：|^解析:/,
    ana = /^分析|^\[分析\]|【分析】|^分析：|^分析:/,
    choice = /^([A-Z]+)[．.,，:： )](.+)/g,
    bodyImg = /<img\b[^<>]*>/g;


export const splitproblem = (arr, problemSplitType) => {
    const { problemNumType, 
        problemChoiceType, 
        problemAnswerType, 
        problemAnalyseType, 
        problemExplainType,
        problemSubNumType,
        problemSubExplainType
    } = problemSplitType
    let numberReg = problemNumType
    let stringArr = []
    let problemInitArr = []
    let problemNumber = 0

    // 去除多余标签，只保留img/table标签
    for (var i = 0; i < arr.length; i++) {
        const removeTagString = removeTagsButKeepImg(arr[i])
        stringArr.push(removeTagString)
    }

    // 需要再次细化一下，没有特殊表示的行，可以通过index的位置来处理
    stringArr.forEach((str, index) => {
        if (numberReg.test(str)) {
            problemNumber++
            problemInitArr.push({
                startLine: index, // 上一个关键字出现的行数标识
                body: str, // 题干
                initChoices: [],
                answer: '', //答案
                explains: '', // 解析
                analysis: '', // 分析
                content: [], //不知道是啥字段的放这里
                lastType: 'body', // 最后一个字段的类型
                subproblems: [], // 子题
            })
        } else if (problemAnswerType.test(str)) {
            // 答案
            problemInitArr[problemNumber - 1].answer = str
            problemInitArr[problemNumber - 1].lastType = 'answer'
        } else if (problemExplainType.test(str)) {
            // 解析
            problemInitArr[problemNumber - 1].explains = str
            problemInitArr[problemNumber - 1].lastType = 'explains'
        } else if (problemAnalyseType.test(str)) {
            // 分析
            problemInitArr[problemNumber - 1].analysis = str
            problemInitArr[problemNumber - 1].lastType = 'analysis'
        } else if (problemChoiceType.exec(str) !== null) {
            // 选项
            if(problemInitArr[problemNumber - 1].lastType === 'body'){
                problemInitArr[problemNumber - 1].initChoices.push(str)
            }
        }
        // else if(bodyImg.test(str)){
        //     // 图片 
        //     if(problemNumber !== 0 ){
        //         switch (problemInitArr[problemNumber-1].lastType) {
        //             case 'answer':
        //                 problemInitArr[problemNumber-1].answer += str
        //                 return 
        //             case 'explains':
        //                 problemInitArr[problemNumber-1].explains += str
        //                 return 
        //             case 'analysis':
        //                 problemInitArr[problemNumber-1].analysis += str
        //                 return
        //         }
        //     }
        // } 
        else if(problemSubNumType.test(str)){
            if(problemInitArr[problemNumber - 1].lastType === 'body'){
                problemInitArr[problemNumber - 1].subproblems.push({
                    body: str
                })
            }
        } else if(problemSubExplainType.test(str)){
            const subLength = problemInitArr[problemNumber - 1].subproblems.length
            if(subLength > 0) {
                problemInitArr[problemNumber - 1].subproblems[subLength-1]['explains'] = str
            }
        }
        else {
            if (problemNumber !== 0) {
                let { lastType } = problemInitArr[problemNumber - 1]

                // 再筛选一下选项,有些详解会包含选项，需要单独处理
                if (problemChoiceType.test(str) && lastType === 'body') {
                    problemInitArr[problemNumber - 1].initChoices.push(str)
                    return
                }
                switch (lastType) {
                    case 'answer':
                        problemInitArr[problemNumber - 1].answer += str
                        return
                    case 'explains':
                        problemInitArr[problemNumber - 1].explains += str
                        return
                    case 'analysis':
                        problemInitArr[problemNumber - 1].analysis += str
                        return
                    case 'body':
                        problemInitArr[problemNumber - 1].body += str
                        return
                }
            }


        }
    })

    return problemInitArr
}

