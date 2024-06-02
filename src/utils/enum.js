// 一些正则枚举
// const num = /^(\d+)[．.,、，:： )](.+)|^第(\d+)题(.+)/g
const num1 = /^(\d+)(.+)/g
const num2 = /^第(\d+)题(.+)/g
const num3 = /^(\d+)[)](.+)/g
const num4 = /^(\d+)）(.+)/g
const num5 = /^\d+/g
const num6 = /^（\d+）/g
const num7 = /^\d+\)/g


// A.
const choice1 = /^[A-Z]\./g

// A)
const choice2 = /^[A-Z]\)/g

//a.
const choice3 = /^[a-z]\./g

//(A)
const choice4 = /^([A-Z]\))/g

const answer1 = /^\[答案\]/g
const answer2 = /^【答案】/g

const analyse1 = /^\[分析\]/g
const analyse2 = /^【分析】/g

const explain1 = /^\[解析\]/g
const explain2 = /^【解析】/g

const subNum1 = num6
const subNum2 = num7

const subExplain = /^【小问\d+解析】/g

export const numType = {
    1:num1,
    2:num2,
    3:num3,
    4:num4,
    5:num5,
    6:num6,
    7:num7,
}

export const choiceType = {
    1:choice1,
    2:choice2,
    3:choice3,
    4:choice4,
}

export const answerType = {
    1:answer1,
    2:answer2,
}

export const analyseType = {
    1:analyse1,
    2:analyse2,
}

export const explainType = {
    1:explain1,
    2:explain2,
}

export const subNumType = {
    1:subNum1,
    2:subNum2,
}

export const subExplainType = {
    1:subExplain,
}





