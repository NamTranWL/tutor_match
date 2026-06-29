import { Controller, Get } from '@nestjs/common';
import { AdminRole } from '@/decorator/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get('overview')
  @AdminRole()
  async overview() {
    return this.service.getOverview();
  }
}
