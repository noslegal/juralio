/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package server

import builders.dsl.spreadsheet.builder.poi.PoiSpreadsheetBuilder
import com.juralio.auth.AppUser
import com.juralio.auth.UserSessionEventService
import com.juralio.auth.UserStatusEvent
import com.juralio.auth.UserStatusEventType
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationUserConfirmationSummaryService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.post.Post
import com.juralio.post.TaskPostsService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional

import java.sql.Timestamp
import java.text.Format
import java.text.SimpleDateFormat

@Transactional
class ExportService {

    public static final String EXCEL_FILE_SUFIX = ".xlsx"
    public static final String EXCEL_FILE_PREFIX = "matter-export"
    public static final String EXCEL_FILENAME = EXCEL_FILE_PREFIX + EXCEL_FILE_SUFIX

    private static final int COLUMN_WIDTH = 30
    private static final String DATE_FORMAT = "EEE, d MMM yyyy HH:mm:ss Z"

    MatterService matterService
    ProjectService projectService
    TaskService taskService
    TaskPostsService taskPostsService
    OrganisationDAOService organisationDAOService
    OrganisationUserConfirmationSummaryService organisationUserConfirmationSummaryService
    UserStatusEventService userStatusEventService
    UserSessionEventService userSessionEventService
    MatterAuthorisationService matterAuthorisationService

    boolean excludeClosed = false
    boolean limitToMTMs = false


    private String getStatusBeforeEvent(UserStatusEvent event) {
        UserStatusEvent priorEvent = organisationUserConfirmationSummaryService.getPriorEvent(event)

        if (!priorEvent) {
            return '-'
        } else {
            if (priorEvent.eventType == UserStatusEventType.LAPSED.value()) {
                return UserStatusEventType.LAPSED.value().toLowerCase()
            }
            AppUser user = priorEvent.user
            organisationUserConfirmationSummaryService.getConfirmationDate(user)
            boolean isReactivation = event.eventType == UserStatusEventType.REACTIVATION.value()
            boolean inTrailAtThisEvent = user.confirmationStatus != UserStatusEventType.CONFIRMED.value() && (!user.confirmationDate || user.confirmationDate > priorEvent.time)
            boolean confirmedAtThisEvent =  organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(priorEvent)
            if (inTrailAtThisEvent && priorEvent.eventType != UserStatusEventType.CONFIRMED.value()) {
                if (priorEvent.eventType == UserStatusEventType.CONFIRMED.value()) {
                    String state
                    if (event.eventType == UserStatusEventType.ACTIVATION.value() || event.eventType == UserStatusEventType.REACTIVATION.value()) {
                        state = 'Deactivated'
                    } else if (event.eventType == UserStatusEventType.DEACTIVATION.value()) {
                        state = 'Active'
                    } else {
                        state =  organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event,isReactivation) ? 'Active' : 'Deactivated'
                    }
                    return "Trial/${state}"
                }
                return "Trial/${(priorEvent.eventType == UserStatusEventType.ACTIVATION.value()) ? 'Active' :   organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event,isReactivation) ? 'Active' : 'Deactivated'}"

            } else if (confirmedAtThisEvent) {
                if (priorEvent.eventType == UserStatusEventType.CONFIRMED.value()) {
                    String state
                    if (event.eventType == UserStatusEventType.ACTIVATION.value() || event.eventType == UserStatusEventType.REACTIVATION.value()) {
                        state = 'Deactivated'
                    } else if (event.eventType == UserStatusEventType.DEACTIVATION.value()) {
                        state = 'Active'
                    } else {
                        state =  organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event,isReactivation) ? 'Active' : 'Deactivated'
                    }
                    return "Confirmed/${state}"
                }
                return "Confirmed/${(priorEvent.eventType == UserStatusEventType.ACTIVATION.value()) ? 'Active' :   organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event,isReactivation) ? 'Active' : 'Deactivated'}"
            }
            return "Unknown - ${priorEvent.eventType}"
        }
    }

    def exportMatter(OutputStream outs, Long matterId) {
        if (!matterAuthorisationService.hasAdminAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        List<Project> projectList = projectService.getProjectsByMatterId(matterId, excludeClosed, limitToMTMs)

        File file = new File('matter-export.xlsx')
        PoiSpreadsheetBuilder.create(outs).build({ w ->
            w.sheet("Matter - ${matter.getName()}", buildMatterSheet(matter))
            projectList.forEach { project ->
                return w.sheet("Project - ${project.getName()}", buildProjectSheet(project))
            }
        })
        return file
    }

    def exportSeatsData(Long orgId, Date startDate, Date endDate) throws Exception {

        Organisation org = organisationDAOService.getOrganisation(orgId)
        List<AppUser> users = organisationDAOService.getUsersFromOrg(org)

        Calendar calendar = Calendar.getInstance()
        calendar.setTime(startDate)
        calendar.add(Calendar.MONTH, -1)
        Date previousSummaryDate = calendar.getTime()


        MonthlyUsersReportSummary monthlyUsersReportSummary = organisationUserConfirmationSummaryService.getSummaryReportByOrganisationAndDate(orgId, previousSummaryDate)

        File file = File.createTempFile('user-seats', '.xlsx')
        PoiSpreadsheetBuilder.create(file).build({ w ->
            w.sheet("Juralio Seats - ${endDate.getDateString()}", buildUserSeatsSheet(org, users, startDate, endDate, monthlyUsersReportSummary))
        })
        return file
    }


    private Long getSeatCount(Long summarySeats, Long summaryUserCount,List<UserStatusEvent> eventsThisMonth){
        Long seatCount = summarySeats
        Long emptySeats = summarySeats - summaryUserCount


        eventsThisMonth.each {UserStatusEvent event ->
            if(event.eventType == UserStatusEventType.CONFIRMED.value() && organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event)){
                if(emptySeats > 0){
                    emptySeats = emptySeats -1
                } else{
                    seatCount = seatCount+1
                }
            }
            if(event.eventType == UserStatusEventType.REACTIVATION.value() && (organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event)|| organisationUserConfirmationSummaryService.wasLapsedAtThisEvent(event))){
                if(emptySeats > 0){
                    emptySeats = emptySeats -1
                } else{
                    seatCount = seatCount+1
                }
            }
            if(event.eventType == UserStatusEventType.DEACTIVATION.value() && organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event)){
                emptySeats = emptySeats+1
            }
        }

        return seatCount

    }

    private def buildUserSeatsSheet(Organisation org, List<AppUser> users, Date startDate, Date endDate, MonthlyUsersReportSummary seatsSummary) {
        // last month's numbers
        Long summarySeats = seatsSummary && seatsSummary.seats ? seatsSummary.seats : 0

        Long summaryConfirmedActiveUsers = seatsSummary && seatsSummary.confirmedActiveUsers ? seatsSummary.confirmedActiveUsers : 0

        List<UserStatusEvent> allEvents = userStatusEventService.getEventsForUserReport(startDate, endDate).findAll { it.user.organisationId == org.id }


        List<UserStatusEvent> activations = allEvents.findAll { it.eventType == UserStatusEventType.ACTIVATION.value() }.unique{a,b -> a.user.id <=> b.user.id}

        List<AppUser> confirmedUsers = users.findAll { it.confirmationStatus == UserConfirmedStatus.CONFIRMED.value() && it.enabled }
        List<UserStatusEvent> eventsThisMonth = allEvents.findAll { it.eventType == UserStatusEventType.CONFIRMED.value() || it.eventType == UserStatusEventType.DEACTIVATION.value() || it.eventType == UserStatusEventType.REACTIVATION.value() || it.eventType == UserStatusEventType.ACTIVATION.value() || it.eventType == UserStatusEventType.LAPSED.value() }
                .findAll { UserStatusEvent event ->
                    (event.eventType == UserStatusEventType.ACTIVATION.value() && organisationUserConfirmationSummaryService.isFirstEvent(event)) || event.eventType != UserStatusEventType.ACTIVATION.value()
                }

        List<UserStatusEvent> trialing = activations.findAll({ it.user.confirmationStatus != UserConfirmedStatus.WHITELISTED.value() && it.user.trialStartDate && !it.user.trialStartDate.before(startDate) && !it.user.trialStartDate.after(endDate) && users.contains(it.user) })
        List<AppUser> whitelistedUsers = users.findAll({ it.enabled && it.confirmationStatus == UserConfirmedStatus.WHITELISTED.value() })


        Calendar calendar = Calendar.getInstance()
        calendar.setTime(startDate)
        String reportMonthAndYear = calendar.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale.getDefault()) + " " + calendar.get(Calendar.YEAR)

        return { s ->
            // title
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                    c.width(5)

                })
                r.cell({ c ->
                    c.value("")
                    c.width(3)
                })
                r.cell({ c ->
                    c.width(33)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })
                r.cell({ c ->
                    c.value("")
                    c.width(auto)
                })

            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Customer:")

                    c.style({ st ->
                        st.font({ f ->
                            f.size(14)
                        })
                    })
                })
                r.cell({ c ->
                    c.value(org.name)

                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                    })
                })
            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Month:")
                    c.style({ st ->
                        st.font({ f ->
                            f.size(14)
                        })
                    })
                })
                r.cell({ c ->
                    c.value(reportMonthAndYear)
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                    })
                })
            })

            s.row()

            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Summary")
                    c.colspan(2)
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                    })
                })
                r.cell({ c ->
                    c.value("")
                })
            })

            // SEATS SUMMARY
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, left, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    c.value("")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    c.value("This month")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    })
                })
                r.cell({ c ->
                    c.value("Last month")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    c.value("Change")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })

                r.cell({ c ->
                    c.value("Seats*")
                    c.colspan(2)
                    c.style(st -> {
                        st.border(left, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                        st.font({ f ->
                            f.style(bold);
                            f.size(10)
                        })
                    });
                })
                r.cell({ c ->
                    c.value(getSeatCount(summarySeats as Long,summaryConfirmedActiveUsers as Long,eventsThisMonth))
                    c.style({ st ->
                        st.align(center, left)
                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                    })
                })
                r.cell({ c ->
                    c.value(summarySeats)
                    c.style(st -> {
                        st.align(center, left)
                    });
                })
                r.cell({ c ->
                    Long seatCount = getSeatCount(summarySeats as Long,summaryConfirmedActiveUsers as Long,eventsThisMonth)
                    c.value(seatCount - summarySeats > 0 ? "+${seatCount - summarySeats}" : 0)
                    c.style(st -> {
                        st.border(right, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                        st.align(center, left)
                    });
                })

            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Confirmed accounts active at month end**")
                    c.colspan(2)
                    c.style(st -> {
                        st.font({ f ->
                            f.style(bold);
                            f.size(10)
                        })
                        st.border(left, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
//                    c.value("${summaryConfirmedActiveUsers + newlyConfirmedActiveUsers.size()}")
                    c.value(confirmedUsers.size())
                    c.style({ st ->
                        st.align(center, left)

                        st.font({ f ->
                            f.style(bold);
                            f.size(14)
                        })
                        st.border(bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    })
                })
                r.cell({ c ->
                    c.value(summaryConfirmedActiveUsers)
                    c.style(st -> {
                        st.align(center, left)
                        st.border(bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    def newUsersCount = confirmedUsers.size() - summaryConfirmedActiveUsers
                    c.value(newUsersCount > 0 ? "+${newUsersCount}" : newUsersCount)
                    c.style(st -> {
                        st.align(center, left)
                        st.border(bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })

            })

            // * info
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("* See seat count column in 'Events this month' table below")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(italic);
                            f.size(9)
                        })

                    })
                })
            })


            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("** Number of accounts which are both confirmed and active at the end of the last day of the month")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(italic);
                            f.size(9)
                        })

                    })
                })
            })

            s.row() // space

            // Confirmed accounts active all month summary
            s.row({ r ->

                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Confirmed accounts at end of month:")
                    c.colspan(2)
                    c.style(st -> {
                        st.font({ f ->
                            f.style(bold);
                            f.size(10)
                        })

                    });
                })
                r.cell({ c ->
                    c.value(confirmedUsers.size())
                    c.style(st -> {
                        st.align(center, left)

                        st.font({ f ->
                            f.style(bold);
                            f.size(10)
                        })

                    });
                })
            })

            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("All accounts that were confirmed and active at time of report generation")
                    c.colspan(7)
                    c.style({ st ->
                        {
                            st.font({ f ->
                                f.style(italic);
                                f.size(9)
                            })
                        }
                    })
                })
            })

            // confirmed accounts table header
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, left, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    c.value("Account")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                        st.font(f -> {
                            f.style(bold);
                            f.size(10)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Type")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                        st.font(f -> {
                            f.style(bold);
                            f.size(10)
                        })
                    });
                })
            })

            // print out active accounts that were confirmed in a previous period
            confirmedUsers.eachWithIndex { user, index ->
                boolean isLastEntry = index + 1 == confirmedUsers.size()
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")
                    })
                    r.cell({ c ->
                        c.value(index + 1)
                        c.style(st -> {
                            st.align(center, center)
                            if (isLastEntry) {
                                st.border(left, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(left, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        c.value(user.firstname && user.lastname ? user.firstname + " " + user.lastname : user.username)
                        c.style(st -> {
                            if (isLastEntry) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->
                        c.value(user.externalUserId ? "External" : "Internal")
                        c.style(st -> {
                            if (isLastEntry) {
                                st.border(right, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(right, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                })
            }
            //zero state for previously confirmed accounts
            if (confirmedUsers.size() == 0) {
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")
                    })
                    r.cell({ c ->
                        c.value("-")
                        c.style(st -> {
                            st.align(center, center)
                            st.border(left, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        });
                    })
                    r.cell({ c ->
                        c.value("-")
                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        })
                    })
                    r.cell({ c ->
                        c.value("-")
                        c.style(st -> {
                            st.border(right, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        });
                    })
                })
            }

            // events this month
            s.row()
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Events this month:")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold)
                            f.size(10)
                        })
                    })
                    c.colspan(2)
                })
                r.cell({ c ->
                    c.value(eventsThisMonth.size())
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })

            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Confirmations:")
                    c.colspan(2)
                })
                r.cell({ c ->
                    c.value(eventsThisMonth.count({ it.eventType == UserStatusEventType.CONFIRMED.value() }))
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })

            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Reactivations:")
                    c.colspan(2)
                })
                r.cell({ c ->

                    c.value(eventsThisMonth.count({ it.eventType == UserStatusEventType.REACTIVATION.value() }))
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })

            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Deactivations:")
                    c.colspan(2)
                })
                r.cell({ c ->
                    c.value(eventsThisMonth.count({ it.eventType == UserStatusEventType.DEACTIVATION.value() }))
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("New Accounts:")
                    c.colspan(2)
                })
                r.cell({ c ->
                    c.value(eventsThisMonth.count({ it.eventType == UserStatusEventType.ACTIVATION.value() }))
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("Lapses:")
                    c.colspan(2)
                })
                r.cell({ c ->
                    c.value(eventsThisMonth.count({ it.eventType == UserStatusEventType.LAPSED.value() }))
                    c.style(st -> {
                        st.align(center, left)
                    })
                })
            })

            // events this month table headers
            s.row({ r ->
                r.cell({ c ->
                    c.value("")
                })
                r.cell({ c ->
                    c.value("")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, left, b -> {
                            b.style(thin);
                            b.color(black);
                        });
                    });
                })
                r.cell({ c ->
                    c.value("Account")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Status before event")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Event")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Date / time")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("By")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Seat Count")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Active confirmed accounts")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
            })

            // print out events user details
            Long tempSeatCount = summarySeats
            Long tempActiveSeatCount = summaryConfirmedActiveUsers
            eventsThisMonth.eachWithIndex { UserStatusEvent event, int i ->
                boolean isLastRow = i + 1 == eventsThisMonth.size()
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")
                    })
                    r.cell({ c ->
                        c.value(i + 1)
                        c.style(st -> {
                            st.align(center, center)
                            if (isLastRow) {
                                st.border(left, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(left, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        c.value(event.user.firstname && event.user.lastname ? event.user.firstname + " " + event.user.lastname : event.user.username)
                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        String text = getStatusBeforeEvent(event)
                        c.value(text.substring(0, 1).toUpperCase() + text.substring(1))
                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        String text = event.eventType ? event.eventType == UserStatusEventType.ACTIVATION.value() && organisationUserConfirmationSummaryService.isFirstEvent(event) ? 'New Account Created' : event.eventType.toLowerCase() : '-'
                        c.value(text.substring(0, 1).toUpperCase() + text.substring(1))
                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })

                    r.cell({ c ->
                        Format formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm aa");

                        c.value(event.time ? formatter.format(event.time) : '-')
                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        c.value(event.performedBy && event.performedBy.firstname && event.performedBy.lastname ? event.performedBy.firstname + " " + event.performedBy.lastname : event.eventType == UserStatusEventType.LAPSED.value() ? "Automatic" : event.performedBy.username)
                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        if ( (event.eventType == UserStatusEventType.CONFIRMED.value() || (event.eventType == UserStatusEventType.REACTIVATION.value() && ( organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event) ||  organisationUserConfirmationSummaryService.wasLapsedAtThisEvent(event)))) && tempSeatCount == tempActiveSeatCount) {
                            tempSeatCount = tempSeatCount + 1
                        }

                        c.value(tempSeatCount)
                        c.style(st -> {
                            st.align(center, left)
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                    r.cell({ c ->
                        boolean userWasActiveAtEvent =  organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event)
                        if ((userWasActiveAtEvent ||  organisationUserConfirmationSummaryService.wasLapsedAtThisEvent(event) ) && (event.eventType == UserStatusEventType.CONFIRMED.value() || (event.eventType == UserStatusEventType.REACTIVATION.value() && ( organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event)||  organisationUserConfirmationSummaryService.wasLapsedAtThisEvent(event))))) {
                            tempActiveSeatCount = tempActiveSeatCount + 1
                        }
                        UserStatusEvent priorEvent =  organisationUserConfirmationSummaryService.getPriorEvent(event)
                        if (event.eventType == UserStatusEventType.DEACTIVATION.value() &&  organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(priorEvent)) {
                            tempActiveSeatCount = tempActiveSeatCount - 1
                        }
                        c.value(tempActiveSeatCount)
                        c.style(st -> {
                            st.align(center, left)
                            if (isLastRow) {

                                st.border(right, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(right, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        });
                    })
                })
            }
            if (eventsThisMonth.size() == 0) {
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")

                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.align(center, center)
                            st.border(left, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->

                        c.value('-')

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        });
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.align(center, left)
                            st.border(right, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        });
                    })
                })
            }

            // trial accounts active this month
            s.row()

            s.row({ r ->
                r.cell({ c ->
                    c.value("")

                })
                r.cell({ c ->
                    c.value("Trial accounts which were active at some point this month:")
                    c.colspan(3)
                    c.style(st -> {

                        st.font({ f ->
                            f.style(bold)
                        })
                    })
                })
                r.cell({ c ->
                    c.value(trialing.size())

                    c.style(st -> {
                        st.align(center, left)

                        st.font({ f ->
                            f.style(bold)
                        })
                    })
                })
            })

            // trial accounts table header
            s.row({ r ->
                r.cell({ c ->
                    c.value("")

                })
                r.cell({ c ->
                    c.value("")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, left, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Account")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Free trial started")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("By")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("End of month")
                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
            })

            // print out trialing user details
            trialing.eachWithIndex { UserStatusEvent event, int i ->
                boolean isLastRow = i + 1 == trialing.size()
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")

                    })
                    r.cell({ c ->
                        c.value(i + 1)
                        c.style(st -> {
                            st.align(center, center)
                            if (isLastRow) {
                                st.border(left, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(left, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->
                        c.value(event.user.firstname && event.user.lastname ? event.user.firstname + " " + event.user.lastname : event.user.username)

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->

                        Format formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm aa");

                        c.value(event.user.trialStartDate ? formatter.format(event.user.trialStartDate) : '-')

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->
                        c.value(event.performedBy.firstname && event.performedBy.lastname ? event.performedBy.firstname + " " + event.performedBy.lastname : event.performedBy.username)

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->
                        String lowerString = event.user.confirmationStatus ? event.user.confirmationStatus.toLowerCase() : '-'

                        c.value(lowerString.substring(0, 1).toUpperCase() + lowerString.substring(1))

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(right, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(right, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                })
            }
            if (trialing.size() == 0) {
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")

                    })
                    r.cell({ c ->
                        c.value("-")
                        c.style(st -> {
                            st.align(center, center)
                            st.border(left, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                    r.cell({ c ->

                        c.value('-')

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                    r.cell({ c ->

                        c.value("-")

                        c.style(st -> {
                            st.border(right, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                })
            }

            // free of charge accounts
            s.row()

            s.row({ r ->
                r.cell({ c ->
                    c.value("")

                })
                r.cell({ c ->
                    c.value("Free-of-charge accounts:")

                    c.colspan(2)
                    c.style(st -> {
                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value(whitelistedUsers.size())

                    c.style(st -> {
                        st.align(center, left)
                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
            })

            // free of charge accounts table header
            s.row({ r ->
                r.cell({ c ->
                    c.value("")

                })
                r.cell({ c ->
                    c.value("")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, left, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Account")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
                r.cell({ c ->
                    c.value("Latest login this month")

                    c.style(st -> {
                        st.background("#d3d3d3");
                        st.border(top, bottom, right, b -> {
                            b.style(thin);
                            b.color(black);
                        });

                        st.font({ f ->
                            f.style(bold)
                        })
                    });
                })
            })

            // print out free of charge accounts
            whitelistedUsers.eachWithIndex { AppUser user, int i ->
                boolean isLastRow = i + 1 == whitelistedUsers.size()
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")


                    })
                    r.cell({ c ->
                        c.value(i + 1)

                        c.style(st -> {
                            st.align(center, center)
                            if (isLastRow) {
                                st.border(left, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(left, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    r.cell({ c ->
                        c.value(user.firstname && user.lastname ? user.firstname + " " + user.lastname : user.username)

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                    Timestamp latestLogin = userSessionEventService.getLatestLogin(user)
                    r.cell({ c ->
                        Format formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm aa");

                        c.value(latestLogin && !latestLogin.before(startDate) && !latestLogin.after(endDate) ? formatter.format(new Date(latestLogin.getTime())) : "-")

                        c.style(st -> {
                            if (isLastRow) {
                                st.border(right, bottom, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            } else {
                                st.border(right, b -> {
                                    b.style(thin);
                                    b.color(black);
                                });
                            }
                        })
                    })
                })
            }
            if (whitelistedUsers.size() == 0) {
                s.row({ r ->
                    r.cell({ c ->
                        c.value("")


                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.align(center, center)
                            st.border(left, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        })
                    })
                    r.cell({ c ->
                        c.value("-")

                        c.style(st -> {
                            st.border(bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });

                        })
                    })
                    r.cell({ c ->

                        c.value("-")

                        c.style(st -> {
                            st.border(right, bottom, b -> {
                                b.style(thin);
                                b.color(black);
                            });
                        })
                    })
                })
            }


        }
    }

    private def buildMatterSheet(Matter matter) {
        // -------------------
        // Matter
        // -------------------
        return { s ->
            s.row({ r ->
                r.cell({ c ->
                    c.value("Matter")

                })
                r.cell({ c ->
                    c.value(matter.getName())

                })
            })
            s.row({ r ->
                r.cell("Client")
                r.cell(matter.getClientName())
            })
            s.row({ r ->
                r.cell("Case ID")
                r.cell(matter.getCaseId())
            })
            s.row({ r ->
                r.cell("Status")
                r.cell(matter.getMatterStatus().substring(0, 1).toUpperCase() + matter.getMatterStatus().substring(1))
            })
            s.row({ r ->
                r.cell("Created date")
                r.cell(matter.getCreationDate().format(DATE_FORMAT))
            })
            s.row({ r ->
                r.cell("Created by")
                r.cell(matter.getCreator().getUsername())
            })
            s.row({ r ->
                r.cell("Organisation")
                r.cell(matter.getOrganisation().name)
            })
            s.row({ r ->
                r.cell("Matter Admins")
                matter.getMatterAdmins().forEach {
                    matterAdmin ->
                        r.cell({ c ->
                            c.value(matterAdmin.user.username)

                        })
                }
            })
            s.row({ r ->
                r.cell("Matter Team")
                matter.getTeamMembers().forEach {
                    teamMember ->
                        r.cell({ c ->
                            c.value(teamMember.user.username)

                        })
                }
            })
        }
    }

    private def buildProjectSheet(Project project) {
        List<Task> tasks = taskService.listTasks([project_id: project.id])

        // -------------------
        // Project
        // -------------------
        return { s ->
            s.row({ r ->
                r.cell({ c ->
                    c.value("Project name")

                })
                r.cell({ c ->
                    c.value(project.getName())

                })
            })
            s.row({ r ->
                r.cell("Description")
                project.getDescription() ? r.cell({ c ->
                    c.value(project.getDescription())
                    c.style({ st ->
                        st.wrap(text)
                    })
                }) : r.cell("No description")
            })
            s.row({ r ->
                r.cell("Reference number")
                r.cell(project.getReferenceNumber())
            })
            s.row({ r ->
                r.cell("Status")
                r.cell(project.getActive() ? "Active" : "Inactive")
            })
            s.row({ r ->
                r.cell("Created date")
                r.cell(project.getCreationDate().format(DATE_FORMAT))
            })
            s.row({ r ->
                r.cell("Created by")
                r.cell(project.getCreator().getUsername())
            })
            s.row({ r ->
                r.cell("Closed date")
                r.cell(project.getClosedDate() ? project.getClosedDate().format(DATE_FORMAT) : 'N/A')
            })
            s.row({ r ->
                r.cell("Closed by")
                r.cell(project.getCloser() ? project.getCloser().getUsername() : "N/A")
            })
            s.row({ r ->
                r.cell("")
            })
            s.row({ r ->
                r.cell("Task counts")
            })
            s.row({ r ->
                r.cell("Not started")
                r.cell(project.getTaskCounts().notStartedCount)
            })
            s.row({ r ->
                r.cell("In progress")
                r.cell(project.getTaskCounts().inProgressCount)
            })
            s.row({ r ->
                r.cell("Done")
                r.cell(project.getTaskCounts().doneCount)
            })

            s.row({ r ->
                r.cell("")
            })

            // -------------------
            // Tasks
            // -------------------
            s.row({ r ->
                r.cell({ c ->
                    c.value("Tasks")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold)
                        })
                    })
                })
            })

            if (tasks.isEmpty()) {
                s.row({ r ->
                    r.cell("No tasks")
                })
            } else {
                s.row({ r ->
                    r.cell({ c ->
                        c.value("Reference number")

                    })
                    r.cell({ c ->
                        c.value("Name")

                    })
                    r.cell({ c ->
                        c.value("Description")

                    })
                    r.cell({ c ->
                        c.value("Status")

                    })
                    r.cell({ c ->
                        c.value("Level")

                    })

                    r.cell({ c ->
                        c.value("Date created")

                    })
                    r.cell({ c ->
                        c.value("Last updated")

                    })

                    r.cell({ c ->
                        c.value("Planned start date")

                    })
                    r.cell({ c ->
                        c.value("Planned end date")

                    })
                    r.cell({ c ->
                        c.value("Actual start date")

                    })
                    r.cell({ c ->
                        c.value("Actual end date")

                    })
                    r.cell({ c ->
                        c.value("Team members")

                    })
                    r.cell({ c ->
                        c.value("Followers")

                    })
                })
                tasks.forEach { task ->
                    s.row({ r ->
                        r.cell(task.getReferenceNumber())
                        r.cell(task.getName())
                        r.cell(task.getDescription())
                        r.cell(task.getStatus())
                        r.cell(getTaskLevelAsALetter(task.getLevel()))

                        r.cell(task.getDateCreated().format(DATE_FORMAT))
                        r.cell(task.getLastUpdated() ? task.getLastUpdated().format(DATE_FORMAT) : 'N/A')

                        r.cell(task.getPlannedStartDate() ? task.getPlannedStartDate().format(DATE_FORMAT) : 'N/A')
                        r.cell(task.getPlannedEndDate() ? task.getPlannedEndDate().format(DATE_FORMAT) : 'N/A')
                        r.cell(task.getActualStartDate() ? task.getActualStartDate().format(DATE_FORMAT) : 'N/A')
                        r.cell(task.getActualEndDate() ? task.getActualEndDate().format(DATE_FORMAT) : 'N/A')

                        def teamMembersStr = ''
                        task.getTeamMembers().forEach {
                            teamMember ->
                                teamMembersStr <<= teamMember.user.username + ' '
                        }
                        r.cell(teamMembersStr)

                        def followersStr = ''
                        task.getFollowers().forEach {
                            teamMember ->
                                followersStr <<= teamMember.user.username + ' '
                        }
                        r.cell(followersStr)
                    })
                }
            }

            s.row({ r ->
                r.cell("")
            })

            // -------------------
            // Posts
            // -------------------
            s.row({ r ->
                r.cell({ c ->
                    c.value("Posts")
                    c.style({ st ->
                        st.font({ f ->
                            f.style(bold)
                        })
                    })
                })
            })
            s.row({ r ->
                r.cell({ c ->
                    c.value("Reference number")

                })
                r.cell({ c ->
                    c.value("Task reference number")

                })
                r.cell({ c ->
                    c.value("Name")

                })
                r.cell({ c ->
                    c.value("Description")

                })

                r.cell({ c ->
                    c.value("Date created")

                })
                r.cell({ c ->
                    c.value("Last updated")

                })

                r.cell({ c ->
                    c.value("URL")

                })
                r.cell({ c ->
                    c.value("Private")

                })
                r.cell({ c ->
                    c.value("Finalised")

                })
                r.cell({ c ->
                    c.value("Type")

                })
                r.cell({ c ->
                    c.value("Created by")

                })
                r.cell({ c ->
                    c.value("Start time")

                })
                r.cell({ c ->
                    c.value("End time")

                })

                r.cell({ c ->
                    c.value("Authors")

                })
                r.cell({ c ->
                    c.value("People")

                })
            })
            tasks.forEach { task ->
                List<Post> posts = taskPostsService.getPostsByTaskId(task.id, project.id)
                posts.forEach { post ->
                    s.row({ r ->
                        r.cell(post.getReferenceNumber())
                        r.cell(task.getReferenceNumber())
                        r.cell(post.getName())
                        r.cell(post.getDescription() ? post.getDescription() : "N/A")

                        r.cell(post.getDateCreated().format(DATE_FORMAT))
                        r.cell(post.getLastUpdated() ? task.getLastUpdated().format(DATE_FORMAT) : 'N/A')

                        r.cell(post.getUrl() ? post.getUrl() : "N/A")
                        r.cell(post.getPrivatePost() ? "Yes" : "No")
                        r.cell(post.getFinalised() ? "Yes" : "No")
                        r.cell(post.getType() ? post.getType() : "Note")
                        r.cell(post.getCreator().username)
                        r.cell(post.getStartTime() ? post.getStartTime().format(DATE_FORMAT) : 'N/A')
                        r.cell(post.getEndTime() ? post.getEndTime().format(DATE_FORMAT) : 'N/A')

                        def authorsStr = ''
                        post.getAuthors().forEach {
                            author ->
                                authorsStr <<= author.user.username + ' '
                        }
                        r.cell(authorsStr)

                        def membersStr = ''
                        post.getMembers().forEach {
                            member ->
                                membersStr <<= member.user.username + ' '
                        }
                        r.cell(membersStr)
                    })
                }
            }

//            s.row({ r ->
//                r.cell("");
//            });
//
//            // -------------------
//            // Archived tasks
//            // -------------------
//
//            s.row({ r ->
//                r.cell("");
//            });
//
//            // -------------------
//            // Archived posts
//            // -------------------
        }
    }

    private char getTaskLevelAsALetter(int level) {
        switch (level) {
            case 1: return 'A'
            case 2: return 'B'
            case 3: return 'C'
            case 4: return 'D'
            case 5: return 'E'
            case 6: return 'F'
            default: return '?'
        }
    }
}
