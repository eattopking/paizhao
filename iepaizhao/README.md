# paizhao


高拍仪开发方案

1.	使用h5的navigator.mediaDevices.getUserMedia api 调用摄像头，结合canvas和video实现拍照功能

存在问题：高拍仪聚焦问题导致照片不清，不兼容ie，ie需要适配，可以通过jquery.webcam 插件插入flash实现调用摄像头，结合canvas实现拍照，但是有些需求这个方案无法实现（比如关闭摄像头，获取所有高拍仪设备）

2.	使用高拍仪自身提供的sdk进行开发
存在问题：需要适配不同高拍仪的sdk，目前高拍仪厂家太多，sdk不相同
