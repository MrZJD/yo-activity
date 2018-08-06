'use strict';

import Vue from 'vue';
import axios from 'axios';
import user from 'user';
// import layer from 'layer'; // desc: 弹出层插件

import '<%= stylePath %>'

new Vue({
    el: '#app',
    data: {},
    methods: {
        //适配机型重定向
        adaptation() {
            let href = window.location;
            if (/Android|webOS|iPhone|iPod|iPad|BlackBerry|Windows Phone|SymbianOS/i.test(navigator.userAgent)) {
                if (href.host.indexOf('www') >= 0) {
                    window.location.href = '//m.kuaishouvideo.com/dist' + href.pathname;
                }
            } else {
                if (href.host.indexOf('www') < 0) {
                    window.location.href = '//www.kuaishouvideo.com' + href.pathname.replace('/dist', '');
                }
            }
        },
    },
    mounted: function() {
        // pc / mobile 重定向
        this.adaptation();
    }
});
