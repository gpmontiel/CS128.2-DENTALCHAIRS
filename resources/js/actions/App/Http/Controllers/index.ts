import GoogleAuthController from './GoogleAuthController'
import NotificationController from './NotificationController'
import ClinicalAdminController from './ClinicalAdminController'
import ChairManagerController from './ChairManagerController'
import ProgramManagerController from './ProgramManagerController'
import ClinicianController from './ClinicianController'
import Settings from './Settings'

const Controllers = {
    GoogleAuthController: Object.assign(GoogleAuthController, GoogleAuthController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    ClinicalAdminController: Object.assign(ClinicalAdminController, ClinicalAdminController),
    ChairManagerController: Object.assign(ChairManagerController, ChairManagerController),
    ProgramManagerController: Object.assign(ProgramManagerController, ProgramManagerController),
    ClinicianController: Object.assign(ClinicianController, ClinicianController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers