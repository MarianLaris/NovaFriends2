
const alpha = "abcdefghijklmnopqrstuvwxyz@"
const num = '123456789' 


export function generateOTPCode (){
    let result=""
    for(let i=0; i<8; i++){
        const ran= fixRan()   
        if(fixNum(Math.sqrt(ran))%8<4){
           result+=alpha[fixRan()%alpha.length];
        }else{
            result+=num[fixRan()%num.length];
        }
    }
    return result;
}


function fixRan() {
   return  Math.floor(Math.random()*10000+1)
}


function fixNum(num:number) {
    return  Math.floor(num)
 }