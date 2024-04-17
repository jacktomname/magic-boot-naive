import {ref} from "vue";

const baseApi = import.meta.env.VITE_APP_BASE_API;
export default {
    title: 'Magic Boot',
    baseApi: baseApi,
    filePrefix: '',
    dynamicComponentNames: [],
    config: {},
    uiSize: ref('medium'),
    selectTheme: {
        name: 'default',
        themeOverrides: {}
    },
    themeList: [{
        name: 'default',
        themeOverrides: 'defaultOverrides',
        style: 'defaultStyle'
    }]
}
