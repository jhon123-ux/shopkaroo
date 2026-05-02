import { Router } from 'express'
import * as teamController from '../controllers/team.controller'
import { adminAuth, requirePermission } from '../middleware/auth.middleware'

const router = Router()

router.get('/', adminAuth, requirePermission('team_view'), teamController.getTeamMembers)
router.post('/invite', adminAuth, requirePermission('team_manage'), teamController.inviteTeamMember)
router.patch('/:id', adminAuth, requirePermission('team_manage'), teamController.updateTeamMember)
router.post('/:id/resend-invite', adminAuth, requirePermission('team_manage'), teamController.resendInvite)

export default router
