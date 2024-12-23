<script>
import Loading from '@shell/components/Loading.vue'
import CruResource from '@shell/components/CruResource.vue'
import CreateEditView from '@shell/mixins/create-edit-view'
import { _CREATE, _EDIT } from '@shell/config/query-params'
import { exceptionToErrorsArray } from '@shell/utils/error'

export default {
  name: 'ReviewBundleEditView',
  components: {
    Loading,
    CruResource
  },
  mixins: [CreateEditView],
  props: {
    value: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    resource: {
      type: String,
      required: true
    }
  },
  data() {
    if (!this.value.metadata.name) {
      this.value.metadata.generateName = 'review-bundle-'
    }
    return {
      description: '',
      customName: this.value.metadata?.generateName || 'review-bundle-'
    }
  },
  watch: {
    customName(newName) {
      // Automatically update the metadata.generateName field
      if (newName) {
        this.value.metadata.generateName = `${newName}-`
      } else {
        this.value.metadata.generateName = 'review-bundle-'
      }
    }
  },
  computed: {
    isCreate() {
      return this.mode === _CREATE
    },
    isView() {
      return this.mode !== _CREATE && this.mode !== _EDIT
    },
    editorMode() {
      if (!this.isView) {
        return EDITOR_MODES.EDIT_CODE
      }

      return EDITOR_MODES.VIEW_CODE
    },
    hasBeenCreated() {
      return !!this.value.id
    },
    customNameLength() {
      return this.customName.length
    },
    descriptionLength() {
      return this.description.length
    },
    isCustomNameValid() {
      return this.customName.length >= 0 && this.customName.length <= 15
    },
    isDescriptionValid() {
      return this.description.length >= 0 && this.description.length <= 50
    },
    isFormValid() {
      return this.isCustomNameValid && this.isDescriptionValid
    }
  },
  methods: {}
}
</script>

<template>
  <Loading v-if="!value" />
  <CruResource
    v-else
    :done-route="doneRoute"
    :can-yaml="true"
    :mode="mode"
    :resource="value"
    :errors="errors"
    :validation-passed="isFormValid"
    @error="(e) => (errors = e)"
    @finish="save"
    @cancel="done">
    <h1>EditView</h1>
    <!-- Bundle Name -->
    <div v-if="isCreate" class="input-wrapper">
      <label for="bundle-name">Bundle Name</label>
      <div class="name-container">
        <input id="bundle-name" type="text" v-model="customName" placeholder="Enter bundle name" />
        <span class="char-count-name">{{ customName.length }}/15</span>
      </div>

      <p v-if="!isCustomNameValid" class="error-text">Bundle Name must be upto 15 characters.</p>

      <label for="description">Description</label>
      <div class="textarea-container">
        <textarea id="description" v-model="description" placeholder="Enter bundle Description" />
        <span class="char-count-description">{{ description.length }}/50</span>
      </div>

      <p v-if="!isDescriptionValid" class="error-text">Description must be upto 50 characters.</p>
    </div>
  </CruResource>
</template>

<style scoped>
.name-container {
  position: relative;
  width: 400px;
}
.textarea-container {
  position: relative;
  width: 600px;
}
.char-count-name {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-weight: bold;
  font-size: 12px;
  color: #888;
}

.char-count-description {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-weight: bold;
  font-size: 12px;
  color: #888;
}

.error-text {
  color: #f00;
  font-weight: bold;
}

label {
  font-weight: bold;
  font-size: 22px;
  display: block;
  margin-top: 20px;
}

input {
  padding: 10px;
  font-size: 16px;
  width: 400px;
  box-sizing: border-box;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: Arial;
}

textarea {
  padding: 10px;
  font-size: 16px;
  width: 600px;
  box-sizing: border-box;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: Arial;
  resize: none;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #666;
}

/* Placeholder text styling */
input::placeholder,
textarea::placeholder {
  color: #999;
  font-style: italic;
  opacity: 0.7;
}

/* Add some spacing between sections */
div[v-if='isCreate'] {
  padding: 20px;
  background-color: #a62d2d;
  border-radius: 10px;
  margin-top: 10px;
}
</style>
