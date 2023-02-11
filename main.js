// ==UserScript==
// @name         青书自动刷视频脚本
// @namespace    https://b.huiwe.cn
// @version      1.2.1
// @description  青书自动刷视频脚本，实现自动播放、自动切换章节、自动跳转下一小节。
// @author       wanyujun
// @match        https://degree.qingshuxuetang.com/gd/Student/Course/CourseShow*
// @icon         https://degree.qingshuxuetang.com/resources/default/images/favicon.ico
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @license      MIT
// @noframes
// ==/UserScript==


(function() {
    'use strict';
    setTimeout(() => {
        let el = $('video')
        if (el.get(0) && el.attr('src')) {
            let player = el.get(0)
            GM_setValue(utils.getTryKey(), 5)
            utils.notify("找到视频组件了，准备开始播放视频")
            player.addEventListener("ended", function() {
                utils.notify("视频播放完毕，即将跳转到下一小节")
                //生成下一节视频NodeId
                let nodeId = utils.getUrlParam('nodeId')
                let nextUrl = utils.getNextUrl(nodeId)
                setTimeout(() => { window.location.href = nextUrl }, 5000)
            })
            player.muted = true
            player.play()
        } else {
            let isChapter = false
            let arr = utils.getUrlParam('nodeId').split('_')
            let nextId = 0
            if (arr.length > 2) nextId = arr.pop()
            let nodeId = arr.join('_')
            if (utils.isKeepTry()) {
                utils.notify("找不到视频组件，尝试跳转到下一小节")
                nodeId += `_${nextId}`
            } else {
                GM_deleteValue(utils.getTryKey())
                isChapter = true
                utils.notify("找不到视频组件，尝试跳转到下一章")
            }
            let nextUrl = utils.getNextUrl(nodeId, isChapter)
            console.log(nextUrl)
            setTimeout(() => { window.location.href = nextUrl }, 5000)
        }
    }, 5 * 1000);
})()

const utils = {

    //生成下一个视频的地址
    getNextUrl(s, isChapter = false) {
        let arr = s.split('_')
        let [prefixStr, chapter] = arr
        let nodeId = prefixStr + '_'
        if (arr.length == 2) {
            nodeId += `${++chapter}`
        } else {
            let [ , , node] = arr
            node++
            if (isChapter) {
                chapter++
            }
            nodeId += chapter + '_' + node
        }

        let regexp = RegExp(prefixStr + "_\\d{1,2}")
        if (utils.getUrlParam('nodeId').split('_').length > 2) {
            regexp = RegExp(prefixStr + "_\\d{1,2}_\\d{1,2}")
        }

        return window.location.href.replace(regexp, nodeId)
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

    //弹出通知
    notify(content) {
        console.log(content)
        GM_notification({
            title: '系统通知',
            text: content,
            timeout: 2000
        })

    },

    getTryKey() {
        let planId   = utils.getUrlParam('teachPlanId')
        let periodId = utils.getUrlParam('periodId')
        let courseId = utils.getUrlParam('courseId')
        let nodeId   = utils.getUrlParam('nodeId')
        let [prefixStr, chapter] = nodeId.split('_')
        return `${planId}_${periodId}_${courseId}_${prefixStr}_${chapter}`
    },

    //判断是否继续尝试
    isKeepTry() {
        let key = utils.getTryKey()
        let tryCount = GM_getValue(key, 0)
        console.log("tryCount = " + tryCount)
        if (tryCount < 5) {
            GM_setValue(key, ++tryCount)
            return true
        }
        return false
    },


}
