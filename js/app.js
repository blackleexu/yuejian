/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		//验证手机号格式是否正确
		var reg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
		if (!reg.test(loginInfo.account)) {
			return callback('手机号码有误');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		//通过读取本地localstorage验证登录
//		var users = JSON.parse(localStorage.getItem('$users') || '[]');
//		var authed = users.some(function(user) {
////			mui.toast(user.account+"--"+user.password);
//			if(loginInfo.account == user.account && loginInfo.password == user.password){
//				mui.toast(loginInfo.account+"--"+loginInfo.password+"--"+user.account+"--"+user.password);
//				console.log(loginInfo.account);
//				console.log(user.account);
//				console.log(loginInfo.password);
//				console.log(user.password);
//				return true;
//			}
//			return false;
//		});
//		if (authed) {
////			mui.toast(loginInfo.account+"--"+loginInfo.password);
//			return owner.createState(loginInfo.account, callback);
//		} else {
////			mui.toast("错误");
//			return callback('用户名或密码错误');
//		}
		//通过接口访问验证登录
		var url='http://172.24.10.175/workout/api.php/login/tel/'+loginInfo.account+'/password/'+loginInfo.password;
		$.ajax({
		    type: "post",
		    url: url,
		    dataType: "jsonp",
		    jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
		    success: function(str){
		    	var tmp=JSON.parse(str);
		    	if(tmp.id){
		    		mui.toast(tmp.id);
					console.log(tmp.id);
					localStorage.setItem("username",tmp.user_name);//设置  
					localStorage.setItem("userid",tmp.id);
					localStorage.setItem("SessionID",tmp.sessionid);
					
					return owner.createState(loginInfo.account, callback);
		    	}
		    	else{
		    		return callback('用户名或密码错误');
		    	}
		    },
		    error: function(){
		    	mui.toast("请求失败，请检查网络");
		    	return callback('用户名或密码错误');
		    }
		});

	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		var reg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
		if (!reg.test(regInfo.account)||regInfo.account.length < 11) {
			return callback('手机号码有误');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}

		var url='http://172.24.10.175/workout/api.php/reg/tel/'+regInfo.account+'/password/'+regInfo.password;
		$.ajax({
		    type: "post",
		    url: url,
		    dataType: "jsonp",
		    jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
		    success: function(str){
		    	if(str.indexOf("error") == -1 ){
//		    		mui.toast(str);
		    		var users = JSON.parse(localStorage.getItem('$users') || '[]');
					users.push(regInfo);
					localStorage.setItem('$users', JSON.stringify(users));
					mui.toast('账号信息已缓存到本地');
					return callback();
		    	}
		    	else{
		    		return callback('该账号已注册');
		    	}
		    },
		    error: function(){
		    	mui.toast("fail");
		    }
		});
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));