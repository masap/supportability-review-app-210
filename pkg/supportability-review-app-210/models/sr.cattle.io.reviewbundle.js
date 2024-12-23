import SteveModel from '@shell/plugins/steve/steve-class'
import { createRoute } from '../utils/custom-routing'

export default class ReviewBundle extends SteveModel {
  get _availableActions() {
    let out = super._availableActions

    // Remove unused menus
    const toFilter = ['goToViewConfig', 'goToClone', 'download']
    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action
      }
    })

    // Add custom menus
    const t = this.$rootGetters['i18n/t']

    const downloadBundle = {
      action: 'downloadThisBundle',
      enabled: this.hasBundle,
      icon: 'icon icon-fw icon-download',
      label: t('sr.menuLabels.downloadBundle'),
      total: 1
    }

    const viewReport = {
      action: 'viewReport',
      enabled: this.hasReport,
      icon: 'icon icon-fw icon-info',
      label: t('sr.menuLabels.viewReport'),
      total: 1
    }

    out.unshift(viewReport)
    out.unshift(downloadBundle)

    return out
  }

  viewReport() {
    const route = createRoute('report', {}, {})
    const product = route.params.product
    const cluster = route.params.cluster
    const id = this.id

    const reportData = JSON.parse(this.status?.reportJSON)
    const report_data = {
      clusterData: [
        { type: 'aks', count: 0 },
        { type: 'eks', count: 0 },
        { type: 'gke', count: 0 },
        { type: 'harvester', count: 0 },
        { type: 'k3s', count: 0 },
        { type: 'rke', count: 0 },
        { type: 'rke2', count: 0 }
      ],
      summaryData: {
        checks_total: 0,
        checks_fail: 0,
        checks_warn: 0,
        checks_skip: 0,
        checks_pass: 0
      },
      vectorData: {}
    }

    reportData.clusters.forEach((cluster) => {
      const typeIndex = report_data.clusterData.findIndex((c) => c.type === cluster.kubernetes_distro)
      if (typeIndex !== -1) {
        report_data.clusterData[typeIndex].count++
      }
      report_data.summaryData.checks_total += cluster.checks_total
      report_data.summaryData.checks_fail += cluster.checks_fail
      report_data.summaryData.checks_warn += cluster.checks_warn
      report_data.summaryData.checks_skip += cluster.checks_skip
      report_data.summaryData.checks_pass += cluster.checks_pass
      cluster.groups.forEach((group) => {
        group.checks.forEach((check) => {
          if (!report_data.vectorData[check.vector]) {
            report_data.vectorData[check.vector] = {
              checks_total: 0,
              checks_pass: 0,
              checks_fail: 0,
              checks_warn: 0,
              checks_skip: 0
            }
          }
          report_data.vectorData[check.vector].checks_pass += check.state === 'pass'
          report_data.vectorData[check.vector].checks_fail += check.state === 'fail'
          report_data.vectorData[check.vector].checks_skip += check.state === 'skip'
          report_data.vectorData[check.vector].checks_warn += check.state === 'warn'
        })
      })
      for (const vectorName in report_data.vectorData) {
        const vectorData = report_data.vectorData[vectorName]
        vectorData.checks_total =
          vectorData.checks_pass + vectorData.checks_fail + vectorData.checks_warn + vectorData.checks_skip
      }
    })

    function compressReportData(reportData) {
      const jsonString = JSON.stringify(reportData)
      return btoa(jsonString)
    }

    const url_data = encodeURIComponent(compressReportData(report_data))

    const url = `/c/${cluster}/${product}/view-report/${id}/?report=${url_data}`
    window.location.href = url
  }

  downloadFromUrl(url, filename) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
      })
      .catch(console.error)
  }

  async downloadThisBundle() {
    const hostname = window.location.host
    try {
      this.downloadFromUrl(
        'https://' +
          hostname +
          '/k8s/clusters/local/api/v1/namespaces/sr-operator-system/services/http:sr-bundle-app-frontend-service:80/proxy/?key=' +
          this.metadata.name,
        this.status?.fileName
      )
    } catch (err) {
      this.$dispatch('growl/fromError', { title: 'Error downloading file', err }, { root: true })
    }
  }

  get hasBundle() {
    const fileName = this.status?.fileName
    if (fileName === undefined || fileName === '') {
      return false
    } else {
      return true
    }
  }

  get hasReport() {
    const reportJSON = this.status?.reportJSON
    if (reportJSON === undefined || reportJSON === '') {
      return false
    } else {
      return true
    }
  }
}
