import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {sha256} from "js-sha256"
import {useDictStore} from "@/store/modules/dictStore";
import {generateRoutes} from "@/scripts/router/loadRouter";
import router from "@/scripts/router"
import {loadDynamicComponent} from '@/scripts/compiler/dynamicComponent'

export const useUserStore = defineStore('user', () => {
    const tokenKey = 'magic_boot_token'
    const auths = ref([])
    const info = ref({})
    const permissionRouters = ref([])

    const getAuths = computed(() => auths.value)
    const getInfo = computed(() => info.value)
    const getPermissionRouters = computed(() => permissionRouters.value)

    function setAuths(value) {
        auths.value = value
    }

    function setInfo(value) {
        info.value = value
    }

    function setPermissionRouters(value) {
        permissionRouters.value = value
    }

    function pushPermissionRouter(value) {
        permissionRouters.value.push(...value)
    }

    function clear() {
        setAuths([])
        setInfo({})
        setPermissionRouters([])
    }

    function getToken() {
        return localStorage.getItem(tokenKey)
    }

    function setToken(token) {
        localStorage.setItem(tokenKey, token)
    }

    function removeToken() {
        localStorage.removeItem(tokenKey)
        clear()
    }

    async function getUserInfo() {
        await $common.get('/system/user/info').then(res => {
            const {data} = res
            if (data) {
                const authorities_ = []
                for (let i = 0; i < data.authorities.length; i++) {
                    authorities_.push(data.authorities[i])
                }
                setAuths(authorities_)
                setInfo(data)
            }
        })
    }

    async function loadData(app) {
        const userStore = useUserStore()
        const dictStore = useDictStore()

        await userStore.getUserInfo()
        await dictStore.getDictData()
        await $common.loadConfig()
        await loadDynamicComponent(app)

        await generateRoutes().then(({ layoutMenus, notLayoutMenus, showMenus }) => {
            userStore.pushPermissionRouter(showMenus)
            layoutMenus.concat(notLayoutMenus).forEach(it => {
                router.addRoute(it)
            })
        })
    }

    function login(data, app) {
        return new Promise((resolve, reject) => {
            $common.postJson('/system/security/login', {
                username: data.username,
                password: sha256(data.password),
                code: data.code,
                uuid: data.uuid
            }).then(async res => {
                let token = res.data
                setToken(token)
                await loadData(app)
                resolve(token)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    function logout() {
        $common.get('/system/security/logout').then(() => {
            removeToken()
            location.reload()
        })
    }

    return {
        getAuths,
        getInfo,
        getPermissionRouters,
        setAuths,
        pushPermissionRouter,
        getToken,
        getUserInfo,
        login,
        logout,
        loadData,
        removeToken
    }

})
