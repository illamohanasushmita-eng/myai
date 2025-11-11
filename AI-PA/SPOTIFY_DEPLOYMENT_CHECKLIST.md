# Spotify Integration - Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.spotify.example` to `.env.local`
- [ ] Add SPOTIFY_CLIENT_ID
- [ ] Add SPOTIFY_CLIENT_SECRET
- [ ] Add NEXT_PUBLIC_SUPABASE_URL
- [ ] Add SUPABASE_SERVICE_ROLE_KEY
- [ ] Verify all environment variables are set
- [ ] Test environment variables locally

### Database Setup
- [ ] Create Supabase project
- [ ] Copy schema from `src/lib/db/schema.sql`
- [ ] Execute schema in Supabase SQL Editor
- [ ] Verify all 4 tables are created
- [ ] Verify RLS policies are enabled
- [ ] Test database connection
- [ ] Verify user data isolation with RLS

### Dependencies
- [ ] Verify @supabase/supabase-js is installed
- [ ] Verify all imports are available
- [ ] Run `npm install` if needed
- [ ] Check for any missing dependencies

### Code Review
- [ ] Review all API routes
- [ ] Review all React hooks
- [ ] Review all services
- [ ] Check TypeScript compilation
- [ ] Run `npm run build` successfully
- [ ] Check for any TypeScript errors
- [ ] Review error handling
- [ ] Review security measures

## Testing

### Unit Tests
- [ ] Test intent detection with various inputs
- [ ] Test Spotify search functionality
- [ ] Test playback control
- [ ] Test automation rules
- [ ] Test user preferences
- [ ] Test error scenarios

### Integration Tests
- [ ] Test API endpoints with Postman
- [ ] Test database operations
- [ ] Test token refresh flow
- [ ] Test end-to-end workflow
- [ ] Test error handling
- [ ] Test RLS policies

### Manual Testing
- [ ] Test MusicAssistant component
- [ ] Test intent detection
- [ ] Test search functionality
- [ ] Test playback
- [ ] Test automation triggers
- [ ] Test preferences management
- [ ] Test error messages
- [ ] Test loading states

### Performance Testing
- [ ] Test response times
- [ ] Test with multiple concurrent requests
- [ ] Test database query performance
- [ ] Check for memory leaks
- [ ] Monitor API rate limits

## Security Verification

### Authentication & Authorization
- [ ] Verify user ID validation on all endpoints
- [ ] Verify RLS policies are working
- [ ] Verify user data isolation
- [ ] Test unauthorized access attempts
- [ ] Verify token security

### Input Validation
- [ ] Verify all inputs are validated
- [ ] Test with invalid inputs
- [ ] Test with SQL injection attempts
- [ ] Test with XSS attempts
- [ ] Verify error messages don't leak info

### Data Protection
- [ ] Verify tokens are stored securely
- [ ] Verify sensitive data is not logged
- [ ] Verify HTTPS is enforced
- [ ] Verify CORS is configured correctly
- [ ] Verify rate limiting is in place

## Staging Deployment

### Pre-Staging
- [ ] Create staging environment
- [ ] Set staging environment variables
- [ ] Create staging database
- [ ] Run schema on staging database
- [ ] Verify staging configuration

### Staging Testing
- [ ] Deploy to staging
- [ ] Run all tests on staging
- [ ] Test with real Spotify API
- [ ] Test with real Supabase
- [ ] Monitor staging logs
- [ ] Check staging performance
- [ ] Verify staging security

### Staging Sign-Off
- [ ] Get approval from team
- [ ] Document any issues found
- [ ] Fix any staging issues
- [ ] Re-test after fixes
- [ ] Final staging verification

## Production Deployment

### Pre-Production
- [ ] Create production environment
- [ ] Set production environment variables
- [ ] Create production database
- [ ] Run schema on production database
- [ ] Verify production configuration
- [ ] Create database backups
- [ ] Document rollback procedure

### Production Deployment
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Monitor production logs
- [ ] Check production performance
- [ ] Verify all endpoints working
- [ ] Test with real users (if applicable)

### Post-Deployment
- [ ] Monitor error rates
- [ ] Monitor API response times
- [ ] Monitor database performance
- [ ] Check user feedback
- [ ] Monitor Spotify API usage
- [ ] Verify token refresh working
- [ ] Check for any issues

## Monitoring & Maintenance

### Ongoing Monitoring
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Setup performance monitoring
- [ ] Setup database monitoring
- [ ] Setup API monitoring
- [ ] Setup uptime monitoring
- [ ] Setup log aggregation

### Regular Maintenance
- [ ] Review error logs weekly
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Review security updates monthly
- [ ] Backup database regularly
- [ ] Test disaster recovery

### Documentation
- [ ] Document deployment procedure
- [ ] Document rollback procedure
- [ ] Document troubleshooting guide
- [ ] Document monitoring setup
- [ ] Document maintenance schedule

## Rollback Plan

### If Issues Occur
- [ ] Identify the issue
- [ ] Document the issue
- [ ] Decide on rollback vs. fix
- [ ] If rollback: restore from backup
- [ ] If fix: deploy hotfix
- [ ] Verify fix/rollback successful
- [ ] Communicate with users

### Rollback Steps
1. [ ] Stop production deployment
2. [ ] Restore database from backup
3. [ ] Restore previous code version
4. [ ] Verify rollback successful
5. [ ] Monitor for issues
6. [ ] Communicate status

## Post-Deployment

### Verification
- [ ] All endpoints responding
- [ ] All features working
- [ ] No error spikes
- [ ] Performance acceptable
- [ ] Users can access features
- [ ] Automation working
- [ ] Preferences saving
- [ ] Playback working

### Documentation
- [ ] Update deployment docs
- [ ] Update troubleshooting guide
- [ ] Document any issues found
- [ ] Document any workarounds
- [ ] Update runbooks

### Team Communication
- [ ] Notify team of deployment
- [ ] Share deployment notes
- [ ] Share monitoring links
- [ ] Share rollback procedure
- [ ] Schedule post-deployment review

## Optimization (Post-Deployment)

### Performance Optimization
- [ ] Analyze slow queries
- [ ] Optimize database indexes
- [ ] Implement caching if needed
- [ ] Optimize API responses
- [ ] Monitor and adjust

### Cost Optimization
- [ ] Review Spotify API usage
- [ ] Review Supabase usage
- [ ] Optimize database queries
- [ ] Review infrastructure costs
- [ ] Implement cost controls

### User Experience
- [ ] Gather user feedback
- [ ] Monitor user behavior
- [ ] Identify pain points
- [ ] Plan improvements
- [ ] Implement enhancements

## Deployment Timeline

### Day 1: Pre-Deployment
- [ ] Environment setup (1 hour)
- [ ] Database setup (1 hour)
- [ ] Code review (2 hours)
- [ ] Unit testing (2 hours)

### Day 2: Testing
- [ ] Integration testing (3 hours)
- [ ] Manual testing (3 hours)
- [ ] Security verification (2 hours)
- [ ] Performance testing (2 hours)

### Day 3: Staging
- [ ] Staging deployment (1 hour)
- [ ] Staging testing (4 hours)
- [ ] Issue resolution (2 hours)
- [ ] Staging sign-off (1 hour)

### Day 4: Production
- [ ] Production deployment (1 hour)
- [ ] Post-deployment verification (2 hours)
- [ ] Monitoring setup (1 hour)
- [ ] Team communication (1 hour)

## Success Criteria

- [ ] All tests passing
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Users can access features
- [ ] Automation working
- [ ] Monitoring in place
- [ ] Documentation complete

## Sign-Off

- [ ] Development Lead: _______________
- [ ] QA Lead: _______________
- [ ] DevOps Lead: _______________
- [ ] Product Manager: _______________
- [ ] Date: _______________

## Notes

```
[Add any additional notes or observations here]
```

---

**Deployment Checklist Version**: 1.0
**Last Updated**: 2025-11-07
**Status**: Ready for Use

