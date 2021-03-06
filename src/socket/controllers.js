/**
 * Socket Controllers.
 * 
 * @author Dominic
 */

'use strict'

const rosControl = require('../roscontrol');
const rosLogger = require('../utils/rosout');

//当前运行模式
let currentLaunchMode = null;

/**
 * 底盘 运动控制
 */
function onCmdVel(req, fn) {
    console.log('recived cmd_vel:', req);
    rosControl.pubCmdVelMsg(req.vx || 0, req.vt || 0);
}

/**
 * 切换运行模式
 */
function onLaunchMode(req, fn) {
    if (req.mode) {
        rosControl.toggleRosLaunchMode(req.mode);
        currentLaunchMode = req.mode;
        if (fn && typeof fn == 'function') {
            fn({
                code: 200,
                message: 'success'
            });
        }
    } else {
        if (fn && typeof fn == 'function') {
            fn({
                code: 500,
                message: 'failde: bad request'
            });
        }
        console.error('/launch_mode: invalid request data:', req);
    }
}

/**
 * 取得当前运行模式
 */
function getCurrentLaunchMode(req, fn) {
    if (fn && typeof fn == 'function') {
        fn({
            code: 200,
            message: 'success',
            data: {
                mode: currentLaunchMode
            }
        })
    }
}

/**
 * 实时rosout 日志打印
 */
function onRosOutCmd(req, fn, client) {
    if (req.method && req.method == 'start') {
        rosLogger.startLogging((data) => {
            client.emit('/rosout/data', data);
        });
        if (fn && typeof fn == 'function') {
            fn({
                code: 200,
                message: 'success'
            });
        }
    } else if (req.method == 'stop') {
        rosLogger.stopLogging();
        if (fn && typeof fn == 'function') {
            fn({
                code: 200,
                message: 'success'
            })
        }
    } else {
        if (fn && typeof fn == 'function') {
            fn({
                code: 500,
                message: 'failed: bad request'
            })
        }
    }
}

/**
 * 初始点角度设置
 */
function onMapInitialAngle(req, fn) {
    console.log('onMapInitialAngle:', req);
    if (req.pose) {
        rosControl.pubInitialPose(req.pose, req.angle || 0);
        if (fn && typeof fn == 'function') {
            fn({
                code: 200,
                message: 'success'
            })
        }
    } else {
        if (fn && typeof fn == 'function') {
            fn({
                code: 500,
                message: 'failed: pose and angle all required'
            })
        }
    }
}

/**
 * 设定导航目标点
 */
function onMoveBaseSimpleGoal(req, fn) {
    if (req.pose) {
        console.log('rosControl-Pub:moveBase Goal:', req)
        rosControl.pubMoveBaseSimpleGoalMsg(req.pose);
        if (fn && typeof fn == 'function') {
            fn({
                code: 200,
                message: 'success'
            });
        }
    } else {
        if (fn && typeof fn == 'function') {
            fn({
                code: 500,
                message: 'failed: pose required'
            });
        }
    }
}

/**
 * 前端实时设定角度回传，交给地图实时显示反馈
 * req:
 * ```
 * {
 *  originalPose:{},///地图点击原始位置数据
 *  angle:0//用户设定角度，0-360
 * }
 * ```
 */
function onSettingAngle(req, fn) {
    if (req) {
        console.log('onSettingAngle:', req);

        rosControl.pubAngleSettingMsg(req)
    }
}

module.exports = {
    'onLaunchMode': onLaunchMode,
    'onCmdVel': onCmdVel,
    'onRosOutCmd': onRosOutCmd,
    'onMapInitialAngle': onMapInitialAngle,
    'onMoveBaseSimpleGoal': onMoveBaseSimpleGoal,
    'getCurrentLaunchMode': getCurrentLaunchMode,
    'onSettingAngle': onSettingAngle,
}