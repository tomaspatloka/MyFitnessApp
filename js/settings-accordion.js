// === ACCORDION SETTINGS RENDER ===
// Nová verze renderSettings s accordion (sbalitelné sekce)

function renderSettingsAccordion() {
    const activeProfile = typeof ProfileManager !== 'undefined' ? ProfileManager.getActiveProfile() : null;
    const profiles = typeof ProfileManager !== 'undefined' ? ProfileManager.getProfiles() : [];

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">settings</span>
                    Nastavení aplikace
                </h2>
            </div>

            <!-- 👤 PROFIL -->
            <div class="settings-accordion">
                <div class="accordion-header" onclick="toggleAccordion('profileAccordion')">
                    <div class="accordion-header-content">
                        <span class="material-symbols-outlined">person</span>
                        <span class="accordion-header-title">👤 Profil</span>
                    </div>
                    <span class="material-symbols-outlined accordion-icon" id="profileAccordionIcon">expand_more</span>
                </div>
                <div class="accordion-content" id="profileAccordion">
                    <div class="accordion-body">
                        ${activeProfile ? `
                            <div class="profile-card" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--md-sys-color-primary-container); border-radius: 12px; margin-bottom: 12px;">
                                <span style="font-size: 2rem;">${activeProfile.icon}</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 500; font-size: 1.1rem;">${activeProfile.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Sync ID: ${activeProfile.syncId.substring(0, 15)}...</div>
                                </div>
                                <button class="icon-button" onclick="editCurrentProfile()" title="Upravit profil">
                                    <span class="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                        ` : ''}
                        ${profiles.length > 1 ? `
                            <div class="settings-item" onclick="showProfileSwitcher()">
                                <div>
                                    <div>Přepnout profil</div>
                                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">${profiles.length} profilů</div>
                                </div>
                                <span class="material-symbols-outlined">swap_horiz</span>
                            </div>
                        ` : ''}
                        <div class="settings-item" onclick="showAddProfileModal()">
                            <span>Přidat nový profil</span>
                            <span class="material-symbols-outlined">person_add</span>
                        </div>
                        ${profiles.length > 1 ? `
                            <div class="settings-item" onclick="showDeleteProfileModal()">
                                <span style="color: var(--md-sys-color-error);">Smazat profil</span>
                                <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">person_remove</span>
                            </div>
                        ` : ''}

                        <h4 style="margin-top: var(--spacing-md); margin-bottom: var(--spacing-sm); font-size: 0.875rem; color: var(--md-sys-color-primary);">Osobní údaje</h4>
                        <div class="form-group">
                            <label class="form-label">Cílová váha (kg)</label>
                            <input type="number" id="targetWeight" class="text-field" value="${AppState.userData.targetWeight}" onchange="updateTargetWeight()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Výška (cm)</label>
                            <input type="number" id="height" class="text-field" value="${AppState.userData.height}" onchange="updateHeight()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Věk</label>
                            <input type="number" id="age" class="text-field" value="${AppState.userData.age}" onchange="updateAge()">
                        </div>
                    </div>
                </div>
            </div>

            <!-- ⚙️ SYSTÉM -->
            <div class="settings-accordion">
                <div class="accordion-header" onclick="toggleAccordion('systemAccordion')">
                    <div class="accordion-header-content">
                        <span class="material-symbols-outlined">tune</span>
                        <span class="accordion-header-title">⚙️ Systém</span>
                    </div>
                    <span class="material-symbols-outlined accordion-icon" id="systemAccordionIcon">expand_more</span>
                </div>
                <div class="accordion-content" id="systemAccordion">
                    <div class="accordion-body">
                        <div class="settings-item">
                            <div>
                                <div>Tmavý režim</div>
                                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Tmavý vzhled pro šetření očí</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${AppState.settings.darkMode ? 'checked' : ''} onchange="toggleDarkMode()">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="settings-item">
                            <div>
                                <div>Zimní režim</div>
                                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Upraví tipy a zamění běh za chůzi</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${AppState.settings.winterMode ? 'checked' : ''} onchange="toggleSetting('winterMode')">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <h4 style="margin-top: var(--spacing-md); margin-bottom: var(--spacing-sm); font-size: 0.875rem; color: var(--md-sys-color-primary);">
                            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">notifications</span>
                            Oznámení
                        </h4>
                        ${typeof renderNotificationSettings === 'function' ? renderNotificationSettings() : `
                            <div class="settings-item">
                                <div>
                                    <div>Notifikace</div>
                                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Povolit připomínky</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" ${AppState.settings.notifications ? 'checked' : ''} onchange="toggleNotifications(this)">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- 💾 DATA & CLOUD -->
            <div class="settings-accordion">
                <div class="accordion-header" onclick="toggleAccordion('dataAccordion')">
                    <div class="accordion-header-content">
                        <span class="material-symbols-outlined">cloud</span>
                        <span class="accordion-header-title">💾 Data & Cloud</span>
                    </div>
                    <span class="material-symbols-outlined accordion-icon" id="dataAccordionIcon">expand_more</span>
                </div>
                <div class="accordion-content" id="dataAccordion">
                    <div class="accordion-body">
                        <h4 style="margin-bottom: var(--spacing-sm); font-size: 0.875rem; color: var(--md-sys-color-primary);">
                            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">cloud</span>
                            Cloudová synchronizace
                        </h4>
                        <div class="settings-item">
                            <div>
                                <div>Synchronizace do cloudu</div>
                                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Záloha dat na Cloudflare</div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${AppState.settings.cloudSync ? 'checked' : ''} onchange="toggleCloudSync(this)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div id="syncStatus" style="padding: 12px; background: var(--md-sys-color-surface-variant); border-radius: 8px; margin-top: 8px; font-size: 0.8rem;">
                            ${typeof CloudSync !== 'undefined' ? `
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                    <span class="material-symbols-outlined" style="font-size: 16px; color: ${CloudSync.isOnline() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)'};">
                                        ${CloudSync.isOnline() ? 'cloud_done' : 'cloud_off'}
                                    </span>
                                    <span>${CloudSync.isOnline() ? 'Online' : 'Offline'}</span>
                                </div>
                                <div>Poslední sync: ${CloudSync.getSyncStatus().lastSyncFormatted}</div>
                            ` : '<div>Načítání...</div>'}
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="button outlined-button" onclick="syncNow()" style="flex: 1;">
                                <span class="material-symbols-outlined">sync</span>
                                Synchronizovat
                            </button>
                            <button class="button text-button" onclick="showSyncId()" title="Zobrazit ID pro obnovu">
                                <span class="material-symbols-outlined">key</span>
                            </button>
                        </div>

                        <h4 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm); font-size: 0.875rem; color: var(--md-sys-color-primary);">
                            <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">save</span>
                            Správa dat
                        </h4>
                        <div class="settings-item">
                            <span>Automatické ukládání</span>
                            <label class="switch">
                                <input type="checkbox" ${AppState.settings.autoSave ? 'checked' : ''} onchange="toggleSetting('autoSave')">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="settings-item" onclick="exportData()">
                            <span>Exportovat data</span>
                            <span class="material-symbols-outlined">download</span>
                        </div>
                        <div class="settings-item" onclick="importData()">
                            <span>Importovat data</span>
                            <span class="material-symbols-outlined">file_upload</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ℹ️ O APLIKACI -->
            <div class="settings-accordion">
                <div class="accordion-header" onclick="toggleAccordion('aboutAccordion')">
                    <div class="accordion-header-content">
                        <span class="material-symbols-outlined">info</span>
                        <span class="accordion-header-title">ℹ️ O aplikaci</span>
                    </div>
                    <span class="material-symbols-outlined accordion-icon" id="aboutAccordionIcon">expand_more</span>
                </div>
                <div class="accordion-content" id="aboutAccordion">
                    <div class="accordion-body">
                        <div class="settings-item" onclick="checkForUpdate()">
                            <div>
                                <div>Zkontrolovat aktualizace</div>
                                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Verze: ${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '2.0.0'}</div>
                            </div>
                            <span class="material-symbols-outlined">system_update</span>
                        </div>
                        <div class="settings-item" onclick="forceUpdate()">
                            <div>
                                <div>Vynutit aktualizaci</div>
                                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Smaže cache a načte novou verzi</div>
                            </div>
                            <span class="material-symbols-outlined">refresh</span>
                        </div>
                        <div class="settings-item" onclick="showAppInfo()">
                            <span>O aplikaci</span>
                            <span class="material-symbols-outlined">info</span>
                        </div>
                        <div class="settings-item" onclick="resetApp()">
                            <span style="color: var(--md-sys-color-error);">Resetovat aplikaci</span>
                            <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">restart_alt</span>
                        </div>
                    </div>
                </div>
            </div>

            <button class="button filled-button full" onclick="saveSettings()" style="margin-top: var(--spacing-lg);">
                <span class="material-symbols-outlined">save</span>
                Uložit nastavení
            </button>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

// Toggle accordion function
function toggleAccordion(accordionId) {
    const content = document.getElementById(accordionId);
    const icon = document.getElementById(accordionId + 'Icon');

    if (!content || !icon) return;

    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        content.classList.remove('expanded');
        icon.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        icon.classList.add('expanded');
    }
}
