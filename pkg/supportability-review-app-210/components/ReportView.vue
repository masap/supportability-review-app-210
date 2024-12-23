<template>
  <div>
    <!-- Title page -->
    <div ref="printableReport" class="sr-letter-size">
      <ClusterDistroWidget :info="clusterData" />
      <ChecksSummaryWidget :info="summaryData" />
      <VectorsInfoWidgetDoughnut :info="vectorData" />
      <Summary />
    </div>
  </div>
</template>

<script>
import PrimeLogo from '../images/rancher-prime-logo-color-720x290.jpg'
import ClusterDistroWidget from './ClusterDistroWidget.vue'
import ChecksSummaryWidget from './ChecksSummaryWidget.vue'
import VectorsInfoWidgetDoughnut from './VectorsInfoWidgetDoughnut.vue'
import Summary from './Summary.vue'

export default {
  name: 'ReportView',
  components: {
    ClusterDistroWidget,
    ChecksSummaryWidget,
    VectorsInfoWidgetDoughnut,
    Summary
  },
  setup() {
    return {
      PrimeLogo
    }
  },
  data() {
    return {
      reportObject: null,
      clusterData: [],
      summaryData: {
        checks_total: 0,
        checks_fail: 0,
        checks_warn: 0,
        checks_skip: 0,
        checks_pass: 0
      },
      vectorData: new Map()
    }
  },
  created() {
    this.fetchReport()
  },

  methods: {
    fetchReport() {
      const id = this.$route.params.id
      const reportJSON = this.$route.query.report
      let reportData

      if (reportJSON) {
        try {
          const decodedData = atob(decodeURIComponent(reportJSON))
          reportData = JSON.parse(decodedData)
          this.clusterData = reportData.clusterData || []
          this.summaryData = reportData.summaryData || {}
          this.vectorData = new Map(Object.entries(reportData.vectorData || {}))
        } catch (error) {
          console.error('Error decoding or parsing report JSON:', error)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
}
.custom-button {
  background-color: #2453ff;
  color: white;
  padding: 6px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.custom-button:hover {
  background-color: #0056b3;
}

.sr-letter-size {
  background-color: rgb(255, 255, 255);
  width: 8.5in;
  height: 11in;
}
</style>
