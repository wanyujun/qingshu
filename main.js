// ==UserScript==
// @name         青书自动刷视频脚本
// @namespace    https://b.huiwe.cn
// @version      1.0
// @description  青书自动刷视频脚本
// @author       wanyujun
// @match        https://degree.qingshuxuetang.com/gd/Student/Course/CourseShow*
// @icon         https://degree.qingshuxuetang.com/resources/default/images/favicon.ico
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(() => {
        let player = document.getElementById('vjs_video_3_html5_api')
        if (player) {
            console.log("找到视频组件了，准备开始播放视频")
            player.addEventListener("ended", function() {
                console.log("视频播放完毕，即将跳转到下一条视频");
                //生成下一节视频NodeId
                let nodeId = utils.getUrlParam('nodeId')
                let nextUrl = utils.getNextUrl(nodeId)
                window.location.href = nextUrl
            })
            player.play()
        } else {
            let title = document.getElementsByClassName('learn-title')[0].innerHTML
            if (title == '课程设计') {
                console.log("课程学习完毕")
            } else {
                console.log("找不到视频组件，尝试跳转到下一章")
                let nodeId = utils.getUrlParam('nodeId')
                let nextUrl = utils.getNextUrl(nodeId, true)
                window.location.href = nextUrl
            }
        }
    }, 5000);
})();


const utils = {

    //生成下一个视频的地址
    getNextUrl(s, isChapter = false) {
        let [ , chapter, node] = s.split('_')
        node++
        if (isChapter) {
            chapter++
            node = 1
        }
        return window.location.href.replace(/kcjs_\d{1,2}_\d{1,2}/, `kcjs_${chapter}_${node}`)
    },

    //获取地址栏指定参数
    getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        } else {
            return "";
        }
    },


}
